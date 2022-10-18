// grid declarations
import {FieldType} from "@/lib-components/grid/inputs/Base";

export const MODE_TABLE = "table";
export const MODE_UPDATE = "update";
export const MODE_CREATE = "create";
/**
 * @return {string}
 */
export const FieldComponent = function (field) {

    if (_.get(field, "view", false) !== false && typeof field.view !== "undefined") {
        return field.view;
    }

    if(_.get(field, "type", false) !== false&&_.get(field, "name", false) !== false){
    switch (field.type) {
        case FieldType.File:
            return "input-file"
        case FieldType.Text:
        case FieldType.Password:
        case FieldType.Integer:
        case FieldType.Float:
            return "input-integer-text";
        case FieldType.TextArea:
            return "input-text-area";
        case FieldType.Time:
        case FieldType.Date:
        case FieldType.DateTime:
            return "input-date-time";
        case FieldType.MultiSelect:
        case FieldType.BelongsTo:
        case FieldType.Select:
            return "input-belongs-to";
        case FieldType.ManyToMany:
            return "input-many-to-many";
        case FieldType.HasOne:
            return "input-has-one";
        case FieldType.HasMany:
            return "input-has-many";
        case FieldType.Bool:
            return "input-bool"
        default:
            console.error("The component \"" + field.type + "\" is not implemented (" + field.name + ")");
            return "";
    }
    }
};
