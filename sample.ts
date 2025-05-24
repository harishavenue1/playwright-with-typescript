const axios = require('axios');
axios.post('https://reqres.in/api/users', { name: 'morpheus', job: 'leader' }, { headers: { 'Authorization': undefined } })
  // @ts-ignore
  .then(res => console.log(res.status, res.data))
  // @ts-ignore
  .catch(err => console.error(err.response?.status, err.response?.data));