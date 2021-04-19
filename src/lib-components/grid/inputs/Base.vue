<script>
export let FieldType = {
  Integer: "Integer",
  File: "File",
  Text: "Text",
  Password: "Password",
  TextArea: "TextArea",
  Float: "Float",
  Time: "Time",
  Date: "Date",
  DateTime: "DateTime",
  HasOne: "hasOne",
  BelongsTo: "belongsTo",
  Bool: "Bool",
  Select: "Select",
  HasMany: "hasMany",
  ManyToMany: "m2m",
};

export default {
  /**
   * properties
   * field - {obj} includes the field information from the backend
   * value - is the v-model of the component
   */
  props: ["field", "value", "translations", "outlined", "dense", "filled", "hint", "rows", "rowHeight"],
  data() {
    return {
      FieldType: FieldType
    }
  },
  methods: {
    /**
     * isType checks if the field is equal to the given type
     *
     * @param type
     * @returns {boolean}
     */
    isType(type) {
      return this.field.type === type
    },
    /**
     * isEmpty checks if the value of the field is empty
     *
     * @returns {boolean}
     */
    isEmpty() {
      return this.value === "" || this.value == null
    },
    /**
     * isHidden checks if the field should be hidden
     *
     * @returns {boolean}
     */
    isHidden() {
      return _.get(this.field, "hidden", false)
    },
    isReadOnly() {
      return _.get(this.field, "readOnly", false)
    },
    isRequired() {
      if (_.get(this.field, "options.validate", false) !== false) {
        if (this.field.options.validate.includes("required")) {
          return true
        }
      }
      return false
    },
  },
  computed: {

    /**
     * getLabel returns the label of the field.
     * If the field is required, a * will be added at the end.
     *
     * @returns {function(*=): string}
     */
    getLabel: function () {
      return this.required === true ? this.$t(this.field.title) + ' *' : this.$t(this.field.title);
    },
    getLabelDate: function () {
      return this.required === true ? this.$t(this.field.title) + " " + this.$t("COMMON.Time") + ' *' : this.$t(this.field.title) + " " + this.$t("COMMON.Time");
    },
    getLabelTime: function () {
      return this.required === true ? this.$t(this.field.title) + " " + this.$t("COMMON.Date") + ' *' : this.$t(this.field.title) + " " + this.$t("COMMON.Date");
    },
    /**
     * fieldValue is used to set value correct to the given v-model of the parent call
     */
    fieldValue: {
      get() {
        return this.value;
      },
      set(newValue) {
        this.$emit('input', newValue);
        if (Array.isArray(newValue)) {
          // needed somehow, computed item was not triggered.
          this.$emit('changes');
        }
      }
    },
  }
}
</script>
