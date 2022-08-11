// seed.js is going to be the file we run whenever we want to seed our database, we'll create a bunch of supes at once

// only deletes supes that don't have an owner already

const mongoose = require('mongoose')
const Supe = require('./supe')
const db = require('../../config/db')

const startSupes = [
    { 
        name: 'Batman', 
        hero: true, 
        description: 'Works all night, sleeps all day', 
        rating: 95
    },
    { 
        name: 'Joker', 
        hero: false, 
        description: "Always finds a way to mess up Batman's night", 
        rating: 95
    },
    { 
        name: 'Superman', 
        hero: true, 
        description: 'Ultra strong but useless when kryptonite comes in to play (which is like all the time)', 
        rating: 7
    },
    
]

// first we need to connect to the database
mongoose.connect(db, {
    useNewUrlParser: true
}) 
    .then(() => {
        // first we remove all of the supes
        Supe.deleteMany({ owner: null })
            .then(deletedSupes => {
                console.log('deletedSupes', deletedSupes)
                // the next step is to use our startSupes array to create our seeded supes
                Supe.create(startSupes)
                    .then(newSupes => {
                        console.log('the new supes', newSupes)
                        mongoose.connection.close()
                    })
                    .catch(error => {
                        console.log(error)
                        mongoose.connection.close()
                    })
            })
            .catch(error => {
                console.log(error)
                mongoose.connection.close()
            })
    })
    .catch(error => {
        console.log(error)
        mongoose.connection.close()
    })