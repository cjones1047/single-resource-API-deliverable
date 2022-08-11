const mongoose = require('mongoose')

const supeSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		hero: {
			type: Boolean,
			required: true
		},
		description: {
			type: String,
			required: true,
		},
		rating: {
			type: Number,
			required: true
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Supe', supeSchema)
