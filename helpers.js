const handlebars = require('handlebars');

module.exports = {
    "formatDate": (dateString) => {
        return new handlebars.SafeString(
            new Date(dateString).toISOString().split('T')[0]
        );
    }
}
