import {FieldType} from '@/lib-components/grid/inputs/Base';

export var validation = {
    data() {
        return {
            required: false,
            counter: false,
            email: false,
            errorMessages: []
        }
    },
    methods: {
        unique() {
            if (this.value==="" || this.value===null){
                return true;
            }
            let msg = this.field.title+" must be unique"
            this.$api.get(this.api.replace("mode/update/", "mode/callback/").replace("mode/create", "mode/callback") + "/callback/unique/f/" + this.field.name + "/v/" + this.value).then((resp) => {
                if (!_.get(resp.data, "data", false)) {
                    this.errorMessages = [msg]
                } else {
                    this.errorMessages = []
                }
            }).catch((err) => {
                this.errorMessages = [msg]
            })
            return true
        }
    },
    computed: {
        rules() {
            let rules = [];
            if (!this.isHidden() && _.get(this.field, "options.validate.0", false) !== false) {

                let validate = this.field.options.validate[0]
                let omitempty = (validate.includes("omitempty") && !validate.includes("required"));
                let arr = validate.split(",");

                arr.forEach((tag) => {
                    let tagArr = tag.split("=");
                    let key = tagArr[0];
                    let value = (tagArr.length === 2) ? tagArr[1] : null;

                    if (this.isEmpty() && omitempty) {
                        this.required = false;
                        return true;
                    }

                    switch (key) {
                        case "email":
                            if (!omitempty) { //needed because the backend throws an error if its empty and no omitempty is set
                                this.required = true;
                                rules.push(required(this.value, "Field is mandatory"));
                            }
                            this.email = true;
                            rules.push(email(this.value, "This is not a valid email"));
                            break;
                        case "unique":
                            rules.push(this.unique);
                            break;
                        case "required":
                            this.required = true;
                            rules.push(required(this.value, "Field is mandatory"));
                            break;
                        case "min":
                            switch (this.field.type) {
                                case FieldType.Integer:
                                    rules.push(min(this.value, value, "Mined out"));
                                    break;
                                case FieldType.TextArea:
                                case FieldType.Text:
                                    rules.push(stringSizeMin(this.value, value, "Use more letters"));
                                    break;
                                case FieldType.Select:
                                case FieldType.ManyToMany:
                                    rules.push(arraySizeMin(this.value, value, "Field is mandatory"));
                                    break;
                            }
                            break;
                        case "max":
                            switch (this.field.type) {
                                case FieldType.Integer:
                                    rules.push(max(this.value, value, "Maxed out"));
                                    break;
                                case FieldType.TextArea:
                                case FieldType.Text:
                                    this.counter = value;
                                    rules.push(stringSizeMax(this.value, value, "Use less letters"));
                                    break;
                            }
                            break;
                        case "numeric":
                            if (!omitempty) { //needed because the backend throws an error if its empty and no omitempty is set
                                this.required = true;
                                rules.push(required(this.value, "Field is mandatory"));
                            }
                            if (this.field.type === FieldType.Integer) {
                                rules.push(integer(this.value, "Only full numbers are allowed"));
                            } else {
                                rules.push(numeric(this.value, "This is not a number"));
                            }
                            break;
                        case "validator.ValueOf":
                            rules.push(valueOf(this.value, this.field.validator[key].Values, this.field.validator[key].Msg));
                            break;
                        case "validator.Time":
                            //TODO HH:MM && HH:MM:SS
                            // /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/gm
                            break;
                    }
                });
            }
            return rules
        }
    }
};

export const required = function (v, msg) {
    if (v===0){
        return true
    }
    return !!v || msg;
};

export const email = function (v, msg) {
    const email = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gm;
    return (v != null && v.match(email) != null) ? true : msg;
};


export const numeric = function (v, msg) {
    // TODO
    return (!isNaN(v) ? true : msg)
};

export const integer = function (v, msg) {
    let re = new RegExp('^\\d+$');
    return (re.test(v) && Number.isInteger(v) ? true : msg)
};

export const min = function (v, min, msg) {
    return (parseInt(v) >= parseInt(min)) ? true : msg;
};

export const max = function (v, max, msg) {
    return (parseInt(v) <= parseInt(max)) ? true : msg;
};

export const valueOf = function (v, values, msg) { //for selects later on
    //TODO
    console.log("validators: TODO valueOf");
    return false;
};

export const arraySizeMin = function (v, min, msg) { // calculate the string size in bytes
    if (v === null || v.length < min){
        return msg
    }
   return true
};

export const stringSizeMax = function (v, max, msg) { // calculate the string size in bytes
    //TODO check if necessary?!?
    let size = new Blob([v]).size; // -> 4
    return (size <= max) ? true : msg;
};

export const stringSizeMin = function (v, max, msg) { // calculate the string size in bytes
    //TODO check if necessary?!?
    let size = new Blob([v]).size; // -> 4
    return (size >= max) ? true : msg;
};
