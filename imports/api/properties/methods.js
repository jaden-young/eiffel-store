import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Properties} from "../properties/properties";


export const getProperties = new ValidatedMethod({
    name: 'getProperties',
    validate: null,
    run(){
        let properties = Properties.findOne();
        if (properties === undefined) {
            properties = {};
            Properties.insert(properties);
        }
        return properties;
    }
});

export const setProperties = new ValidatedMethod({
    name: 'setProperties',
    validate: null,
    run({properties}){
        Properties.remove({});
        Properties.insert(properties);
    }
});

export const getProperty = new ValidatedMethod({
    name: 'getProperty',
    validate: null,
    run({propertyName}){
        return getProperties.call()[propertyName]
    }
});

export const setProperty = new ValidatedMethod({
    name: 'setProperty',
    validate: null,
    run({propertyName, propertyValue}){
        let properties = getProperties.call();
        properties[propertyName] = propertyValue;
        setProperties.call({properties: properties})
    }
});