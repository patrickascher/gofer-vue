export {default as LoginLayout} from './layout/Login.vue';
export {default as DashLayout} from './layout/Dash.vue';
export {default as GridLayout} from './layout/Grid.vue';

// views
export {default as GridTableView} from './grid/views/Table.vue'
export {default as GridEditView} from './grid/views/Edit.vue'
export {default as TranslationView} from './translation/Translation.vue';
export {default as GridHistoryView} from './grid/views/EditHistory.vue'

// input fields
export {default as InputBase} from './grid/inputs/Base.vue';
export {default as InputBelongsTo} from './grid/inputs/BelongsTo.vue';
export {default as InputBool} from './grid/inputs/Bool.vue';
export {default as InputDateTime} from './grid/inputs/DateTime.vue';
export {default as InputFile} from './grid/inputs/File.vue';
export {default as InputHasMany} from './grid/inputs/HasMany.vue';
export {default as InputHasOne} from './grid/inputs/HasOne.vue';
export {default as InputIntegerText} from './grid/inputs/IntegerText.vue';
export {default as InputManyToMany} from './grid/inputs/ManyToMany.vue';
export {default as InputTextArea} from './grid/inputs/TextArea.vue';
export {FieldType as InputFieldType} from './grid/inputs/Base.vue';
export {FieldComponent as InputType} from './grid/common';

// services
export {default as Alert} from './alert/Alert.vue';
export {default as Config} from './services/config';
export {http as Http} from './services/http';

// validation
export {validation as InputValidation} from "./grid/mixins/validation";

// stores
export {store as Store} from './store';
export {ALERT as StoreAlert} from './store/modules/types';
export {SELECT as StoreSelect} from './store/modules/types';

export {userService as UserService} from './services/user';
export {i18nService as I18nService} from './services/i18n';
export {i18n as i18n} from './services/i18n';
