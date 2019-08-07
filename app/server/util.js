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

const pgDataTypes = {
  16: 'BOOL',
  17: 'BYTEA',
  18: 'CHAR',
  20: 'INT8',
  21: 'INT2',
  23: 'INT4',
  24: 'REGPROC',
  25: 'TEXT',
  26: 'OID',
  27: 'TID',
  28: 'XID',
  29: 'CID',
  114: 'JSON',
  142: 'XML',
  194: 'PG_NODE_TREE',
  210: 'SMGR',
  602: 'PATH',
  604: 'POLYGON',
  650: 'CIDR',
  700: 'FLOAT4',
  701: 'FLOAT8',
  702: 'ABSTIME',
  703: 'RELTIME',
  704: 'TINTERVAL',
  718: 'CIRCLE',
  774: 'MACADDR8',
  790: 'MONEY',
  829: 'MACADDR',
  869: 'INET',
  1033: 'ACLITEM',
  1042: 'BPCHAR',
  1043: 'VARCHAR',
  1082: 'DATE',
  1083: 'TIME',
  1114: 'TIMESTAMP',
  1184: 'TIMESTAMPTZ',
  1186: 'INTERVAL',
  1266: 'TIMETZ',
  1560: 'BIT',
  1562: 'VARBIT',
  1700: 'NUMERIC',
  1790: 'REFCURSOR',
  2202: 'REGPROCEDURE',
  2203: 'REGOPER',
  2204: 'REGOPERATOR',
  2205: 'REGCLASS',
  2206: 'REGTYPE',
  2950: 'UUID',
  2970: 'TXID_SNAPSHOT',
  3220: 'PG_LSN',
  3361: 'PG_NDISTINCT',
  3402: 'PG_DEPENDENCIES',
  3614: 'TSVECTOR',
  3615: 'TSQUERY',
  3642: 'GTSVECTOR',
  3734: 'REGCONFIG',
  3769: 'REGDICTIONARY',
  3802: 'JSONB',
  4089: 'REGNAMESPACE',
  4096: 'REGROLE'
};

// Util exports
module.exports = {
  closeServer,
  encrypt,
  pgDataTypes
};
