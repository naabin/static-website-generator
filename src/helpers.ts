import handlebars from 'handlebars';

export default {
    "formatDate": (dateString: string) => {
        return new handlebars.SafeString(
            new Date(dateString).toISOString().split('T')[0]
        );
    }
}
