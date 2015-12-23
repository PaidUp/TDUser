'use strict';

function validateTypeAddressSync(contact) {
  if(contact != 'shipping' && contact != 'billing' && contact != 'other' && contact != 'loan'){
    return false;
  }
  return true;
}

exports.validateTypeAddressSync = validateTypeAddressSync;