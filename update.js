const fs = require('fs');
const file = 'c:/Users/Lenovo/Desktop/RGMS/my-react-app/src/components/Login/Login.jsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<button className="primary-btn" onClick={handleLogin}>Login</button>`;
const replacement = `<button className="primary-btn" onClick={handleLogin}>Login</button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <button type="button" className="text-link" onClick={switchToForgotPassword} style={{ margin: 0 }}>
                    Forgot Password?
                  </button>
                  <button type="button" className="text-link" style={{ margin: 0, color: '#4ade80', fontWeight: 'bold' }} onClick={() => window.open('http://localhost:5173', '_blank')}>
                    Free Demo (Visitor System)
                  </button>
                </div>`;

code = code.replace(target + '\n                <button\n                  type="button"\n                  className="text-link"\n                  onClick={switchToForgotPassword}\n                >\n                  Forgot Password?\n                </button>', replacement);

fs.writeFileSync(file, code);
console.log('Done!');
