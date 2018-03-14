var mongoose = require('mongoose');
var validator = require('validator');

mongoose.Promise = global.Promise;

/**
 * Settings Schema!
 *
 * Fields with select: false are not public.
 * These can be retrieved in controller methods.
 *
 * @type {mongoose}
 */
var schema = new mongoose.Schema({
    status: String,
    timeOpen: {
        type: Number,
        default: 0
    },
    timeClose: {
        type: Number,
        default: Date.now() + 31104000000 // Add a year from now.
    },
    timeConfirm: {
        type: Number,
        default: 604800000 // Date of confirmation
    },
    timeStart: {
        type: Number,
        default: Date.now()
    },
    timeEnd: {
        type: Number,
        default: Date.now() + 3600 * 24
    },
    whitelistedEmails: {
        type: [String],
        select: false,
        default: ['.edu', '.ca', '.com', '.net', '.fr', '.es', '.cat'],
    },
    waitlistText: {
        type: String
    },
    acceptanceText: {
        type: String,
    },
    confirmationText: {
        type: String
    },
    allowMinors: {
        type: Boolean
    }
});

/**
 * Get the list of whitelisted emails.
 * Whitelist emails are by default not included in settings.
 * @param  {Function} callback args(err, emails)
 */
schema.statics.getWhitelistedEmails = function (callback) {
    this
        .findOne({})
        .select('whitelistedEmails')
        .exec(function (err, settings) {
            return callback(err, settings.whitelistedEmails);
        });
};

/**
 * Get the open and close time for registration.
 * @param  {Function} callback args(err, times : {timeOpen, timeClose, timeConfirm})
 */
schema.statics.getRegistrationTimes = function (callback) {
    this
        .findOne({})
        .select('timeOpen timeClose timeConfirm timeStart timeEnd')
        .exec(function (err, settings) {
            callback(err, {
                timeOpen: settings.timeOpen,
                timeClose: settings.timeClose,
                timeConfirm: settings.timeConfirm,
                timeStart: settings.timeStart,
                timeEnd: settings.timeEnd
            });
        });
};

schema.statics.getPublicSettings = function (callback) {
    this
        .findOne({})
        .exec(callback);
};

module.exports = mongoose.model('Settings', schema);