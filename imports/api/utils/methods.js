import {ValidatedMethod} from "meteor/mdg:validated-method";

export const isAlive = new ValidatedMethod({
        name:'isAlive',
        validate:null,
        run(){

           // console.log("Called isAlive");
            return 'hunter2';
        }
    }
);