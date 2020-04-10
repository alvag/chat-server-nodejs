export default class ValidationErrors {
    public static getJoiError = ( joiError: any ) => {
        const error: any = {};
        const { key } = joiError.context;
        let message = ValidationErrors.getFieldName( key );
        const errorData = ValidationErrors.getErrorMessage( {
            type: joiError.type,
            limit: joiError.context.limit
        } );
        message += errorData.message ? ` ${errorData.message}` : ` ${joiError.message}`;

        error.message = message;
        error[ key ] = {
            ...errorData,
            message
        };

        return error;
    };

    public static getMongooseErrors = ( errors: any ) => {
        return new Promise( ( resolve ) => {
            const arr = Object.keys( errors ).map( ( key: string ) => {
                const error = errors[ key ];
                const type =
                    error.path === 'email' && error.kind === 'user defined'
                        ? 'invalid.email'
                        : error.kind;

                let message = type === 'enum' ? '' : ValidationErrors.getFieldName( key );

                const errorData = ValidationErrors.getErrorMessage( {
                    type,
                    message: error.message,
                    limit: error.properties[ type ]
                } );

                message += ` ${errorData.message}`;

                return {
                    ...errorData,
                    key,
                    message: message.trim()
                };
            } );

            const obj: any = {};

            arr.forEach( ( item, index ) => {
                if ( index === 0 ) {
                    obj[ 'message' ] = item.message;
                }
                obj[ item.key ] = {
                    ...item
                };
                delete obj[ item.key ].key;

                if ( index === arr.length - 1 ) {
                    resolve( obj );
                }
            } );
        } );
    };

    private static getErrorMessage = ( error: any ): any => {
        switch ( error.type ) {
            case 'any.empty':
            case 'any.required':
            case 'required':
                return { message: `es un campo requerido.`, required: true };
            case 'unique':
                return { message: `debe ser único.`, unique: true };
            case 'string.min':
            case 'minlength':
                return {
                    message: `debe tener al menos ${error.limit} caracteres.`,
                    minlength: true
                };
            case 'string.max':
            case 'maxlength':
                return {
                    message: `no debe tener más de ${error.limit} caracteres.`,
                    maxlength: true
                };
            case 'string.email':
            case 'invalid.email':
                return { message: `no tiene un formato válido.`, invalid: true };
            case 'object.allowUnknown':
                return { message: `no es una propiedad permitida.`, allowUnknown: true };
            case 'string.regex.base':
                return {
                    message: `no cumple con el formato requerido.`,
                    regex: true,
                    pattern: true
                };
            case 'enum':
                return {
                    message: error.message,
                    enum: true
                };
            case 'boolean.base':
                return {
                    message: 'debe ser un booleano',
                    boolean: true
                };
            default:
                return '';
        }
    };

    private static getFieldName = ( field: any ): string => {
        switch ( field ) {
            case 'name':
            case 'firstName':
                return 'El nombre';
            case 'lastName':
                return 'El apellido';
            case 'email':
                return 'El correo';
            case 'password':
                return 'La contraseña';
            case 'hexCode':
                return 'El código hexadecimal';
            case 'type':
                return 'El tipo';
            case 'active':
                return `La propiedad ${field}`;
            case 'from':
                return 'El emisor';
            case 'to':
                return 'El destinatario';
            case 'message':
                return 'El mensaje';
            default:
                return field;
        }
    };
}
