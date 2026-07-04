import jwt from 'jsonwebtoken';

async function main() {
  const token = jwt.sign({ id: 'f7beb56c-3fa8-4e75-b98c-5039c1468839' }, 'secret');
  
  const res = await fetch('http://localhost:3000/api/workflows', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

main();
