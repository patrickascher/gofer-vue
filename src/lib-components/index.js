import {dateService} from "@/lib-components/services/date";

export {default as UserProfile} from './layout/Profile.vue';
export {default as LoginLayout} from './layout/Login.vue';
export {default as DashLayout} from './layout/Dash.vue';
export {default as GridLayout} from './layout/Grid.vue';
export {default as DashNavigationLayout} from './layout/dash/Navigation.vue';

// views
export {default as GridTableView} from './grid/views/Table.vue'
export {default as GridEditView} from './grid/views/Edit.vue'
export {default as TranslationView} from './translation/Translation.vue';
export {default as GridHistoryView} from './grid/views/EditHistory.vue'
export {default as GridFilterView} from './grid/views/UserFilter.vue'

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

//common
export {MODE_CREATE as GRID_CREATE} from './grid/common';
export {MODE_UPDATE as GRID_UPDATE} from './grid/common';
export {MODE_TABLE as GRID_TABLE} from './grid/common';


// services
export {default as Alert} from './alert/Alert.vue';
export {default as Config} from './services/config';
export {http as Http} from './services/http';
export {dateService as DateService} from './services/date';
export {default as UploadService} from './services/upload';

// validation
export {validation as InputValidation} from "./grid/mixins/validation";

// stores
export {store as Store} from './store';
export {ALERT as StoreAlert} from './store/modules/types';
export {SELECT as StoreSelect} from './store/modules/types';
export {USER as StoreUser} from './store/modules/types';
export {NAVIGATION as StoreNavigation} from './store/modules/types';
export {GRID as StoreGrid} from './store/modules/types';

export {userService as UserService} from './services/user';
export {i18nService as I18nService} from './services/i18n';
export {i18n as i18n} from './services/i18n';

// History
export {HistoryToString as HistoryToString} from './grid/views/EditHistory.vue'
