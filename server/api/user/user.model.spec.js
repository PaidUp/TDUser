'use strict';
var faker = require('faker');

var data = {
    userBad:{
        firstName : faker.name.firstName() + ' 2',
        lastName : faker.name.lastName() + ' 3',
        birthDate:'2015-15-29',
        height:-90,
        weight:-180,
        gender: 'masculino'
    },
    user:{
        id : 'xxx',
        firstName : faker.name.firstName(),
        lastName : faker.name.lastName(),
        birthDate:'1987-12-12',
        hashedPassword: 'Qwerty1!',
        email: faker.internet.email(),
        newEmail: faker.internet.email(),
        fullName: function(){
            return this.firstName + ' ' + this.lastName;
        },
        height:90,
        weight:180,
        gender: 'male',
        password:'Qwerty1!',
        token:'',
        verifyToken:'',
        label : 'label',
        type : 'telephone',
        valueContact : 'value',
        typeAddress: 'billing',
        labelAddress : 'label',
        address1 : 'address 1',
        address2 : 'address 2',
        city : 'city',
        state : 'state',
        country : 'country',
        zipCode : '00000',
        addressId: '',
        idChild:'',
        firstNameChild : faker.name.firstName(),
        lastNameChild : faker.name.lastName(),
        typeRelation: 'child',
        ssn : '457555462'
    },
  encryptKey : 'PZ3oXv2v6Pq5HAPFI9NFbQ==',
  encryptValue : ''
}

module.exports = data;
