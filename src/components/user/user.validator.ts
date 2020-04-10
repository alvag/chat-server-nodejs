import Joi from 'joi';

const create = ( user: any ) => {
    const schema = {
        name: Joi.string().trim().min( 2 ).max( 50 ).required(),
        email: Joi.string().trim().email().min( 6 ).max( 255 ).required(),
        password: Joi.string().trim().required(),
        phone: Joi.string().trim(),
        bio: Joi.string().trim(),
        facebook: Joi.string().trim(),
        twitter: Joi.string().trim(),
        createdAt: Joi.date(),
        active: Joi.boolean()
    };

    return Joi.validate( user, schema, { allowUnknown: false } );
};

const update = ( user: any ) => {
    const schema = {
        name: Joi.string().trim().min( 2 ).max( 50 ),
        password: Joi.string().trim(),
        active: Joi.boolean()
    };

    return Joi.validate( user, schema, { allowUnknown: true } );
};

const userValidator = {
    create,
    update
};

export default userValidator;
