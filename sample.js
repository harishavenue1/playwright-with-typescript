const axios = require('axios');
// axios.post('https://reqres.in/api/users', { name: 'morpheus', job: 'leader' }, { headers: { 'Authorization': undefined } })
//   .then(res => console.log(res.status, res.data))
//   .catch(err => console.error(err.response?.status, err.response?.data));

axios.get('https://reqres.in/api/users', { headers: {} })
.then(res => console.log(res.status, res.data))
.catch(err => console.error(err.response?.status, err.response?.data));