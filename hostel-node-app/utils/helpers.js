const AppError = require("./appError");

exports.removeFieldsFilter = ([...fields], reqBody) => {
    let bodyObj = { ...reqBody };
    fields.forEach(el => {
        bodyObj = delete bodyObj[el];
        console.log(bodyObj);
    });


    return bodyObj;
}


exports.allowFieldsFilter = ([...allowedFields], obj) => {
    
    const newObj = {};

    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key)) {
            newObj[key] = obj[key]
        }
    });

    return newObj;
    
}

exports.restrictedFieldsError = ([...restrictedFields], obj) => {
    
    let errorMessage ='';

    Object.keys(obj).forEach(key => {
        if (restrictedFields.includes(key)) {

            errorMessage += `${key} is a restricted field. Can't update , `
            
        }
    });

    return errorMessage;


}