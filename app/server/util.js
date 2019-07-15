// Util function for manually killing server
function closeServer(server, message) {
  if (server) {
    server.close(function() {
      console.log(message);
    });
    server.destroy();
  }
}

// Encrypting and decrypting functionality for password storage
const SimpleCrypto = require('simple-crypto-js').default;

var _secretKey = 'some-unique-key';
var simpleCrypto1 = new SimpleCrypto(_secretKey);
var simpleCrypto2 = new SimpleCrypto(_secretKey);

function encrypt(password, task) {
  if (task === 'encrypt') {
    let cipherText = simpleCrypto1.encrypt(password);
    return cipherText;
  } else if (task === 'decrypt') {
    let decipherText = simpleCrypto2.decrypt(password);
    return decipherText;
  }
}

// Util exports
module.exports = {
  closeServer,
  encrypt
};
