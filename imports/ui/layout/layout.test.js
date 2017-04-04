import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { faker } from 'meteor/practicalmeteor:faker';
import { resetDatabase } from 'meteor/xolvio:cleaner';

if(Meteor.isClient){
    describe('my module', function () {
        it('shows the aggregated level', function () {
            assert(true == false);
        })
    })

}
