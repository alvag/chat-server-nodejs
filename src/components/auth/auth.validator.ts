import Joi from 'joi';

const authValidator = ( data: any ) => {
    const schema = {
        email: Joi.string().trim().email().min( 6 ).max( 255 ).required(),
        password: Joi.string().trim().min( 1 ).max( 255 ).required()
    };

    return Joi.validate( data, schema, { allowUnknown: false } );
};

export default authValidator;
