import Joi from 'joi';

const create = ( message: any ) => {
    const schema = {
        from: Joi.string().trim().required(),
        to: Joi.string().trim().required(),
        message: Joi.string().trim().required(),
    };

    return Joi.validate( message, schema, { allowUnknown: false } );
};

const getMessage = ( message: any ) => {
    const schema = {
        from: Joi.string().trim().required(),
        to: Joi.string().trim().required(),
    };

    return Joi.validate( message, schema, { allowUnknown: false } );
};

const messageValidator = {
    create,
    getMessage
};

export default messageValidator;
