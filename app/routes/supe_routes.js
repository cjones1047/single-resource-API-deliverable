// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for supes
const Supe = require('../models/supe')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /supes
router.get('/supes', (req, res, next) => {
	Supe.find()
		.then((supes) => {
			// `supes` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return supes.map((supe) => supe.toObject())
		})
		// respond with status 200 and JSON of the supes
		.then((supes) => res.status(200).json({ supes: supes }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// SHOW
// GET /supes/:id
router.get('/supes/:id', (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Supe.findById(req.params.id)
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "supe" JSON
		.then((supe) => res.status(200).json({ supe: supe.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// CREATE
// POST /supes
router.post('/supes', requireToken, (req, res, next) => {
	// set owner of new supe to be current user
	req.body.supe.owner = req.user.id

	Supe.create(req.body.supe)
		// respond to succesful `create` with status 201 and JSON of new "supe"
		.then((supe) => {
			res.status(201).json({ supe: supe.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE
// PATCH /supes/:id
router.patch('/supes/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.supe.owner

	Supe.findById(req.params.id)
		.then(handle404)
		.then((supe) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, supe)

			// pass the result of Mongoose's `.update` to the next `.then`
			return supe.updateOne(req.body.supe)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY
// DELETE /supes/:id
router.delete('/supes/:id', requireToken, (req, res, next) => {
	Supe.findById(req.params.id)
		.then(handle404)
		.then((supe) => {
			// delete the supe ONLY IF the above didn't throw
			supe.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router
