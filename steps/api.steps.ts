import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import axios from 'axios';

When('I send a GET request to {string}', async function (url: string) {
  try {
    const response = await axios.get(url);
    this.response = { status: response.status, data: response.data }; // Only keep essentials
  } catch (error: any) {
    this.response = error.response
      ? { status: error.response.status, data: error.response.data }
      : { status: 500, data: null };
  }
});

Then('the response status should be {int}', function (status: number) {
  expect(this.response.status).to.equal(status);
});

Then('the response should contain a {string} in every item', function (key: string) {
  const data = this.response.data;
  expect(Array.isArray(data)).to.be.true;
  data.forEach((item: any) => {
    expect(item).to.have.property(key);
  });
});

Then('the response should contain {string} as {int}', function (key: string, value: number) {
  const data = this.response.data;
  expect(data[key]).to.equal(value);
});

Then('the response array length should be {int}', async function (length: number) {
  const data = this.response.data;
  expect(Array.isArray(data)).to.be.true;
  expect(data.length).to.equal(length);

  // Attach the array to the report (as JSON string)
  if (this.attach) {
    await this.attach(
      `Response array (${data.length} items):\n` + JSON.stringify(data, null, 2),
      'text/plain'
    );
  }
});

Then('the object at index {int} should have {int} keys', function (index: number, keyCount: number) {
  const data = this.response.data;
  expect(Array.isArray(data)).to.be.true;
  expect(Object.keys(data[index]).length).to.equal(keyCount);
});

Then('the object at index {int} should have the following:', async function (index: number, dataTable) {
  const data = this.response.data;
  expect(Array.isArray(data)).to.be.true;
  const obj = data[index];
  const expected = dataTable.rowsHash();

  // Check number of keys
  try {
    expect(Object.keys(obj).length).to.equal(Object.keys(expected).length);
  } catch (e) {
    const msg = `Key count mismatch: actual keys=${JSON.stringify(Object.keys(obj))}, expected keys=${JSON.stringify(Object.keys(expected))}`;
    console.error(msg);
    if (this.attach) await this.attach(msg);
    throw e;
  }

  // Check each key and value
  for (const [key, value] of Object.entries(expected)) {
    const expectedValue = isNaN(Number(value)) ? value : Number(value);
    try {
      expect(obj).to.have.property(key, expectedValue);
    } catch (e) {
      const msg = `Mismatch for key "${key}": actual="${obj[key]}", expected="${expectedValue}"`;
      console.error(msg);
      if (this.attach) await this.attach(msg);
      throw e;
    }
  }
});

Then('attach all userIds from the response array', async function () {
  const data = this.response.data;
  expect(Array.isArray(data)).to.be.true;
  const userIds = data.map((item: any) => item.userId);

  // Count occurrences of each userId
  const userIdCounts: Record<string, number> = {};
  userIds.forEach((id: number | string) => {
    userIdCounts[id as string] = (userIdCounts[id as string] || 0) + 1;
  });

  // Prepare report text
  const repeated = Object.entries(userIdCounts)
    .filter(([_, count]) => count > 1)
    .map(([id, count]) => `userId ${id}: ${count} times`)
    .join('\n') || 'No repeated userIds.';

  const reportText =
    `All userIds:\n${JSON.stringify(userIds, null, 2)}\n\n` +
    `Repeated userIds with counts:\n${repeated}`;

  if (this.attach) {
    await this.attach(reportText, 'text/plain');
  }
});