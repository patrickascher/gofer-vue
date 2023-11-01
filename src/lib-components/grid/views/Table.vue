<script>
import {store} from '@/lib-components/store'
import {ALERT, USER, NAVIGATION, GRID} from '@/lib-components/store/modules/types'
import {
  VBtn,
  VCol,
  VDataTable,
  VFlex,
  VIcon,
  VList,
  VListItem,
  VListItemTitle,
  VMenu,
  VProgressLinear,
  VRow,
  VSkeletonLoader,
  VSpacer,
  VTextField,
  VDialog,
VDivider,
VListItemGroup,
    VSelect
} from 'vuetify/lib'
import {http} from '@/lib-components/services/http'
import {Config} from "@/lib-components";
import "./../mdiView";
import InputDateTime from '@/lib-components/grid/inputs/DateTime'
import UserFilter from '@/lib-components/grid/views/UserFilter'
import {userService} from "@/lib-components/services/user";


export default {
  /**
   * properties
   * api - backend API url
   */
  components: {
    VMenu,
    VList,
    VListItem,
    VListItemTitle,
    VTextField,
    InputDateTime,
    VSelect,
    VIcon,
    VBtn,
    VFlex,
    VRow,
    VCol,
    VSkeletonLoader,
    VProgressLinear,
    VSpacer,
    VDataTable,
    VDialog,
    VDivider,
    VListItemGroup,
    UserFilter
  },
  props: {disableFilterPersistent:Boolean,api: String,closedFilter:Boolean,dense:Boolean,additionalPass:Object,itemClass:Function},
  data() {
    return {
      refreshHeader: [], // needed for reloading the headers
      vuetifyLoading: true,
      vuetifyError: false,
      showFilterMenu:false,
      dialogFilter:false,
      dialogFilterId:null,
      primaryKey: [],
      headers: [],
user:{},

      // Items from the backend.
      itemsOrig:[],
      items: [],
      itemsTotal: 0,
      // vuetify pagination object
      pagination: {
        itemsPerPage: 0
      },
      // filter data
      filter: {
        values: {},
        lastValues: {},
      },
      additional:{},
      // backend config/default config will be generated
      config: {
        id: null,
        title: "",
        disableTitle:false,
        description: null,
        userFilterList:[],
        userActiveFilter:{
          id:null,
          group: null,
          rowsPerPage: 0,
          sortby: [],
          sortdesc: []
        },
        filter: {
          disable: null,
          disableQuickFilter: null,
          disableCustomFilter: null,
          openQuickFilter: null,
          allowedRowsPerPage: [],
          rowsPerPage: null,
          persistent:false,
        },
        export: [],
        create: true,
        createLinks: null,
        createTitle:null,
        detail: true,
        update: true,
        delete: true,
        actionRow:true,
      },
    }
  },
  created() {

    // get local data
   this.copyLocalStorageFilter()
    this.user = store.getters['user/' + USER.GET_DATA]
    this.unwatch = store.watch(state => state.grid.reload, () => {
      if (store.state.grid.reload === true) {
        this.getData("pagination")
        store.commit('grid/' + GRID.CLEAR)
      }
    });
  },
  beforeDestroy() {
    this.unwatch();
  },
  /**
   * watch is used to check any changes of the vuetify pagination.
   * If a change happens, the data will get new requested.
   */
  watch: {
    pagination: function (newVal, oldVal) {
      if (_.get(oldVal, "page", false) === false ||
          newVal.page !== oldVal.page ||
          newVal.itemsPerPage !== oldVal.itemsPerPage ||
          newVal.sortBy !== oldVal.sortBy ||
          newVal.sortDesc !== oldVal.sortDesc
      ) {
        this.addLocalStorageFilter()
        this.getData()
      }
    },
  },
  computed: {
    filterQuickAllowed() {
      if (this.config.filter.disable) {
        return false
      }

      if (this.config.filter.disableQuickFilter) {
        return false
      }

      let filter = false;
      _.forEach(this.headers, function (value) {
        if (_.get(value, "filterable", false) !== false) {
          filter = true;
        }
      });
      return filter;
    },
    filterCustomerAllowed() {
      if (this.config.filter.disable) {
        return false
      }
      return !this.config.filter.disableCustomFilter
    },
    initLoaded() {
      return this.headers.length !== 0
    },
    showAction() {
      return this.config.actionRow && (this.config.details || this.config.update || this.config.delete)
    },

    /**
     * headersNotHidden is returning all headers which have the property hide=false.
     */
    headersNotHidden() {
      return this.headers.filter(head => {
        if (_.includes(this.pagination.groupBy, head.name)) {
          return false
        }
        if (head.value === 'grid_action' && !this.showAction) {
          return false
        }
        if (_.get(head, "remove", false)) {
          return false
        }
        if (_.get(head, "hidden", false)) {
          return false
        }
        head.text = this.$t(head.title)
        return typeof head.hide === 'undefined';
      })
    },

  },

  methods: {
    hasSelect(header){
      return _.get(header,'options.select.0.Items',false)
    },
    selectTextTranslation(item) {
      return this.$t(_.get(item,"text",''))
    },
    callbacks(v,h){
      if (v===null||typeof v === "undefined"){
        return ""
      }
      if (h.type === "Bool"){
        if (v===true){
          return this.$t("COMMON.BOOL.True")
        }
        if(v===false){
          return this.$t("COMMON.BOOL.False")
        }
      }
      if (h.type === "Date"){
        if(_.get(this.user.Options, "DateFormat", false) !== false && this.user.Options.DateFormat==="YYYY-MM-DD"){
          return v.substring(0, 10)
        }else{
          return v.substring(8,10)+"."+v.substring(5,7)+"."+v.substring(0,4)
        }

      }else if (h.type==="DateTime"){
        if(_.get(this.user.Options, "DateFormat", false) !== false && this.user.Options.DateFormat==="YYYY-MM-DD"){
          return v.substring(0,4)+"-"+v.substring(5,7)+"-"+v.substring(8,10)+" "+v.substring(11,13)+":"+v.substring(14,16)
        }else{
          return v.substring(8,10)+"."+v.substring(5,7)+"."+v.substring(0,4)+" "+v.substring(11,13)+":"+v.substring(14,16)
        }
      }

      return v
    },
    openSavedFilter(id){
      this.dialogFilterId=id
      this.showFilterMenu=true;
      this.dialogFilter=true;
    },
    openQuickfilterFn() {
      this.config.filter.openQuickFilter = !this.config.filter.openQuickFilter
      if (this.config.filter.openQuickFilter === false) {
        this.removeFilter()
      }
    },
    removeFilter() {
      this.filter.values = {}
      this.deleteLocalStorageFilter()
      this.addQuickfilter()
    },
    getValue(item,field, decorator, separator) {
      item = item[field]


      if (decorator === "") {
        return item
      }
      if (!Array.isArray(item)) {
        item = [item]
      }

      let reg = /{{.*?}}/g;
      let matches = decorator.match(reg);
      let rv = []

      _.forEach(item, function (value) {
        let decor = decorator
        _.forEach(matches, function (match) {
          let id = match.replace("{{", "").replace("}}", "").split(".")
          if (_.get(value, id[0], false) !== false) {
            if (typeof value[id[0]] === "object") {
              let tmpValue = []
              _.forEach(value[id[0]], function (value) {
                if (id.length > 1) {
                  tmpValue.push(value[id[1]])
                } else {
                  tmpValue.push(value[Object.keys(value)[0]])
                }
              });
              decor = decor.replace("{{" + id.join(".") + "}}", tmpValue.join(", "))
              //return false; TODO why?
            }
            decor = decor.replace("{{" + id.join(".") + "}}", value[id[0]])
          } else {
            decor = decor.replace("{{" + id.join(".") + "}}", "")
          }
        });

        // check if the result is different as the decorator.
        if (decor !== decorator.replace(new RegExp('{{.*?}}', 'gi'),"")){
          rv.push(decor)
        }else{
          rv.push("")
        }
      });
      return rv.join(separator)
    },
    hasOwnView(header) {
      return _.get(header, 'view', false) !== false;
    },
    noEscaping(header) {
      return _.get(header, 'options.noEscaping.0', false) !== false;
    },
    printPage() {
      window.print();
      return false;
    },
    callExport(type) {
      window.open(Config.get('webserver.domain').replace(/^\/|\/$/g, '') + "/" + this.backendUrl(true).replace(/^\/|\/$/g, '') + "/mode/export/type/" + type+"/lang/"+this.$i18n.locale);
    },
    /**
     * backendUrl is returning the backend api url with sort,filter and header information.
     */
    backendUrl(withHeader) {

      //head information
      let head = "";
      // will load the headers only if requested or no headers are loaded yet.
      if (withHeader !== true && this.headers.length !== 0) {
        head = "/onlyData/1";
      }
      if (withHeader === "pagination" && this.headers.length !== 0) {
        head = "/onlyData/2";
      }

      //order by - optional
      let order = "";
      //withHeader is only set on filter apply, on a new filter apply no custom/link sort should be available.
      if (withHeader !== true && (this.pagination.sortBy.length > 0 || this.pagination.groupBy.length > 0)) {

        order = "/sort/"

        for (let i = 0; i < this.pagination.groupBy.length; i++) {
          if (order !== "/sort/") {
            order += ","
          }
          // todo group desc?
          order += this.pagination.groupBy[i]
        }

        for (let i = 0; i < this.pagination.sortBy.length; i++) {
          if (order !== "/sort/") {
            order += ","
          }
          if (this.pagination.sortDesc[i]) {
            order += "-"
          }
          order += this.pagination.sortBy[i]
        }
      }

      let filter = ""
      if (this.config.userActiveFilter.id != null) {
        filter = "/filter/" + this.config.userActiveFilter.id
      }

      let filterCust = ""
      _.forEach(this.filter.values, function (value, index) {
        if (value !== null && value !== "") {
          filterCust += "/filter_" + index + "/" + value;
        }
      })

      let limit=""
      if (this.pagination.itemsPerPage!==0){
        limit="/limit/" + this.pagination.itemsPerPage
      }
      return encodeURI(this.api + head + limit+ "/page/" + this.pagination.page + order + filter + filterCust)
    },
    addLocalStorageFilter(){
      if(this.config.filter.persistent){
        sessionStorage.setItem(Config.get('webserver.app.name')+'_filter_'+this.$route.path, JSON.stringify({"filterID":this.config.userActiveFilter.id,"pagination":this.pagination,"filters":this.filter.values}));
      }
    },
    deleteLocalStorageFilter(){
      sessionStorage.removeItem(Config.get('webserver.app.name')+'_filter_'+this.$route.path)
    },
    copyLocalStorageFilter(){
      let filter = sessionStorage.getItem(Config.get('webserver.app.name')+'_filter_'+this.$route.path)
          if(filter!==null && this.disableFilterPersistent!==true){
            filter=JSON.parse(filter)
            this.config.userActiveFilter.id=filter.filterID
            this.pagination=filter.pagination
            this.filter.values=filter.filters
            this.filter.lastValues=filter.filters
          }
    },
    addQuickfilterWithTimeout(){
      let _this = this
      setTimeout(() => {_this.addQuickfilter()}, 50)
    },
    addQuickfilter() {
      if (!_.isEqual(this.filter.values, this.filter.lastValues)) {
        // reset pagination
        //this.pagination.itemsPerPage = 10
        this.pagination.page = 1
        this.addLocalStorageFilter()
        this.getData("pagination") //pagination must be reloaded with a filter
        this.filter.lastValues = JSON.parse(JSON.stringify(this.filter.values));
      }
    },
    /**
     * getData is fetching all data from the backend.
     *
     * If everything is OK, the data-grid will get filled with the data.
     * If creating new items is not allowed, the conf.createNew will get set to false.
     * Also the action column will get added to right (by defualt) or to left, if the conf.action.l is set to true.
     *
     * If an error happens, a ALERT.ERROR will get set.
     */
    getData(withHeader) {
      this.vuetifyLoading = true; // set vuetify loading indicator
      let url = this.backendUrl(withHeader)
      http.get(url).then((resp) => {
        // only set data if config exists. (not dataOnly load)
        if (_.get(resp.data, "config", null) !== null) {
          // export
          this.config.export = _.get(resp.data, "config.export", [])
          if (this.config.export == null) {
            this.config.export = []
          }

          // disable the "crud" link
          this.config.id = _.get(resp.data, "config.id", null)
          this.config.title = _.get(resp.data, "config.title", this.$router.currentRoute.name)
          this.config.disableTitle = _.get(resp.data, "config.disableTitle",false)


          this.config.description = _.get(resp.data, "config.description", "")
          this.config.createLinks = _.get(resp.data, "config.action.createLinks", null)
          this.config.createTitle = _.get(resp.data, "config.action.createTitle", null)

          this.config.create = !_.get(resp.data, "config.action.disableCreate", false)
          this.config.detail = !_.get(resp.data, "config.action.disableDetail", false)
          this.config.update = !_.get(resp.data, "config.action.disableUpdate", false)
          this.config.delete = !_.get(resp.data, "config.action.disableDelete", false)
          this.config.actionRow = !_.get(resp.data, "config.action.disableActionRow", false)

          // filter
          this.config.filter.rowsPerPage, this.pagination.itemsPerPage = _.get(resp.data, "config.filter.rowsPerPage", 10)
          this.copyLocalStorageFilter()
          this.config.filter.allowedRowsPerPage = _.get(resp.data, "config.filter.allowedRowsPerPage", [5, 10, 15, 25, 50, 100, 500])
          // open filter bar if a filter is set or configured so.
          if ((url.includes("filter/") || url.includes("filter_")) && this.closedFilter!==true) {
            this.config.filter.openQuickFilter = true;
          } else {
            this.config.filter.openQuickFilter = _.get(resp.data, "config.filter.openQuickFilter", false)
          }
          this.config.filter.disable = _.get(resp.data, "config.filter.disable", false)
          this.config.filter.disableCustomFilter = _.get(resp.data, "config.filter.disableCustomFilter", false)
          this.config.filter.disableQuickFilter = _.get(resp.data, "config.filter.disableQuickFilter", false)
          this.config.filter.persistent = _.get(resp.data, "config.filter.persistent", false)

        }


        //TODO reform:

        // adding total items
        if (_.get(resp.data, "pagination.Total", false) !== false) {
          this.itemsTotal = resp.data.pagination.Total;
        }

        if (_.get(resp.data, "config", false) !== false) {
          // user filters
          if (_.get(resp.data, "config.filter.lists", false) !== false) {
            this.config.userFilterList = resp.data.config.filter.lists
          }


          if (_.get(resp.data, "config.filter.active", false) !== false) {

            if (_.get(resp.data, "config.filter.active.group", false) !== false) {
              this.pagination.groupBy = [resp.data.config.filter.active.group]
              this.pagination.groupDesc = [false]
            }

            if (_.get(resp.data, "config.filter.active.rowsPerPage", false) !== false) {
              this.pagination.itemsPerPage = resp.data.config.filter.active.rowsPerPage
            }

            if (this.config.userActiveFilter.id !== resp.data.config.filter.active.id) {
              this.config.userActiveFilter.id = resp.data.config.filter.active.id
            }

            if (_.get(resp.data, "config.filter.active.sort", false) !== false) {
              var sortBy = []
              var sortDesc = []
              _.forEach(resp.data.config.filter.active.sort, function (value, index) {
                let v = value.split(" ")
                sortBy.push(v[0]);
                sortDesc.push(v[1] === "DESC");
              });

              this.pagination.sortBy = sortBy
              this.pagination.sortDesc = sortDesc
            }
          }
        }

        if (_.get(resp.data, "head", false) !== false) {
          // set the header data
          this.headers = resp.data.head;

          // adding primary keys
          for (let i = 0; i < this.headers.length; i++) {
            if (this.headers[i].primary === true) {
              this.primaryKey[this.headers[i].name] = i;
            }

            this.headers[i].text = this.headers[i].title
            this.headers[i].value = this.headers[i].name

            //width
            if (_.get(this.headers[i], "options.width", false )!==false){
              this.headers[i].width=this.headers[i].options["width"]
            }

            if (!("sortable" in this.headers[i])) {
              this.headers[i].sortable = false
            }

            if (("filterable" in this.headers[i])) {
              if (typeof this.filter.values[this.headers[i].name] === "undefined") {
                this.filter.values[this.headers[i].name] = ""
              }
            }

            if (("hide" in this.headers[i]) && this.headers[i].hide === true) {
              //this.headers[0].class = "grid_hidden"
              delete this.headers[i] // deleted at the moment because there is no hide implementation yet.
            }

          }

          // needed that the binding is working because the props were added manually.
          // TODO better solution
          this.filter.values = JSON.parse(JSON.stringify(this.filter.values));

          // adding action icons
          if (_.get(resp.data, "config.action.positionLeft", false) !== false) {
            this.headers.unshift({text: "Action", width:1, align: "end", sortable: false, value: "grid_action"})
          } else {
            this.headers.push({text: "Action", width: 1, sortable: false, value: "grid_action"})
          }

        }

        // data without decoration
        this.itemsOrig = (resp.data.data == null) ? [] : JSON.parse(JSON.stringify(resp.data.data));


        if (this.headers.length > 0) {
          for (let i = 0; i < this.headers.length; i++) {


            // callback decorator
            if (_.get(this.headers[i], "options.decorator", false) !== false &&
                _.get(this.headers[i], "options.select.0.ReturnValue", false) === false //why? - was true by default before
            ) {

              let head = this.headers[i]
              let _this = this;
              // add no escaping
              let separator = "";
              let _field = head.name;

              if (_.get(_this.headers[i], "options.decorator.1", false) !== false) {
                _this.headers[i].options['noEscaping'] = [true]
                separator = _this.headers[i].options.decorator[1]
              }
              if (_.get(_this.headers[i], "options.decorator.2", false) !== false) {
                _field = _this.headers[i].options.decorator[2]
              }
              _.forEach(resp.data.data, function (value, index) {
                if (resp.data.data[index][head.name] === null) {
                  return;
                }
                resp.data.data[index][head.name] = _this.getValue(resp.data.data[index],_field, _this.headers[i].options.decorator[0], separator)
              });
            }

            // select value with items
            if (_.get(this.headers[i], "options.select.0.Items", false) !== false) {
              let head = this.headers[i]
              let _this = this;
              _.forEach(resp.data.data, function (value, index) {
                if (resp.data.data[index][head.name] === null) {
                  return;
                }
                _.forEach(_this.headers[i].options.select[0].Items, function (v) {
                  if (v.value === resp.data.data[index][head.name]) {
                    resp.data.data[index][head.name] = _this.$t(v.text)
                  }
                });
              });
            }

          }
        }

        this.vuetifyLoading = false; // reset vuetify loading indicator

        // set the items
        this.items = (resp.data.data == null) ? [] : resp.data.data;


        // add additional data
        let additionalData = Object.keys(resp.data)
        additionalData = additionalData.filter(function(e) { return e !== 'data'&& e!=='pagination' && e!=='head' && e!=='config' })
        if (additionalData.length>0){
          let _this = this
          _.forEach(additionalData, function (ad) {
            _this.additional[ad] = resp.data[ad]
          });
        }

      }).catch((error) => {
        this.vuetifyLoading = false; // reset vuetify loading indicator
        this.vuetifyError = true; // set error indicator
        if (_.get(error, "response.data.error", false) !== false) {
          store.commit('alert/' + ALERT.ERROR, error.response.data.error);
        } else {
          store.commit('alert/' + ALERT.ERROR, error);
        }
      });

    },
    applyFilter() {
      // RESET group and sort
      this.pagination.sortBy = []
      this.pagination.sortDesc = []
      this.pagination.groupBy = []
      this.pagination.groupDesc = []
      this.pagination.itemsPerPage = 10
      this.addLocalStorageFilter()
      this.getData(true)
    },
    /**
     * urlWithPrimaryParam is returning a string with the primary as key and value link - parameter.
     */
    urlWithPrimaryParam(item) {
      //Getting the primary key(s) and its value of the item
      let val = "";
      for (let [key] of Object.entries(this.primaryKey)) {
        val += "/" + key + "/" + item[key]
      }
      return val
    },
    /**
     * deleteItem by item
     * TODO: create a template?
     */
    deleteItem(item) {
      if (confirm(this.$t('COMMON.DeleteItem'))) {
        http.delete(this.api + this.urlWithPrimaryParam(item)).then(() => {
          //delete item
          const index = this.items.indexOf(item);
          this.items.splice(index, 1);

          //show alert
          store.commit('alert/' + ALERT.SUCCESS, this.$t('GRID.ItemDeleted'));

          //refresh
          this.getData("pagination")
        }).catch((error) => {
              store.commit('alert/' + ALERT.ERROR, error);
            }
        );
      }
    },
    /**
     * editItem by item
     */
    editItem(item) {
      this.$router.push(this.$route.path + "/mode/update" + this.urlWithPrimaryParam(item));
    },
    updatefilterlistClose(){
      this.showFilterMenu=false;
    },
    updateUserFilterList(value) {
      this.config.userFilterList = (value === null) ? [] : value;
      store.commit('navigation/' + NAVIGATION.RELOAD)

      let reload = false;
      let exists = false;
      let _this = this;
      _.forEach(value, function (entry) {
        if (entry.id === _this.config.userActiveFilter.id) {
          reload = true;
          exists = true;
        }
      });

      if (typeof this.config.userActiveFilter.id !== "undefined" && (reload || !exists)) {
        this.applyFilter()
      }

    }
  }
}

</script>

<template>
  <v-flex>

    <slot :additional="additional" :initLoaded="initLoaded" name="Prepend"></slot>


    <v-row v-if="!config.disableTitle">
      <v-col cols="auto"
             class="mr-auto">

        <v-skeleton-loader
            v-if="vuetifyLoading&&!initLoaded"
            width="300"
            class="mt-4"
            type="text"
        ></v-skeleton-loader>
        <h1 v-if="initLoaded">{{ $t(config.title) }}
          <v-icon v-if="api.indexOf('/filter/')!==-1" @click="openSavedFilter(api.slice(api.indexOf('/filter/')+8,api.indexOf('/filter/')+8+api.slice(api.indexOf('/filter/')+8).indexOf('/')))">mdi-pencil</v-icon>
        </h1>

        <v-progress-linear
            v-if="!initLoaded"
            indeterminate
            color="grey"
            style="border-radius:5px;height:6px;width:50px;"
        ></v-progress-linear>
        <hr v-if="initLoaded&&config.title!=''" color="error" style="border-radius:5px;height:6px;width:50px;"/>
        <p v-if="initLoaded">{{ $t(config.description) }}</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-skeleton-loader
            v-if="vuetifyLoading&&!initLoaded"
            max-width="300"
            max-height="20"
            type="button"
        ></v-skeleton-loader>

        <v-btn
            v-if="config.actionRow&&config.create&&config.createLinks==null&&(!vuetifyLoading||initLoaded)"
            color="primary"
            small
            class="mr-2"
            :to="$route.path + '/mode/create'"
        >
          <span v-if="config.createTitle===null">{{ $t('COMMON.Add') }}</span>
          <span v-else>{{ $t(config.createTitle) }}</span>
        </v-btn>


        <slot :additional="additional" :config="config" :initLoaded="initLoaded" name="HeaderRowNextToAdd"></slot>


        <v-menu offset-y v-if="config.createLinks!=null">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                small
                class="mr-2"
                v-bind="attrs"
                v-on="on"
            >
              {{ $t('COMMON.Add') }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item
                :to="$route.path + '/mode/create/'+item"
                v-for="(item, index) in config.createLinks"
                :key="index"
            >
              <v-list-item-title>{{ index }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>

      <v-spacer></v-spacer>
      <v-col align="end">
        <v-skeleton-loader
            v-if="vuetifyLoading&&!initLoaded"
            max-width="40"
            max-height="20"
            type="button"
            class="mr-5 ml-auto"
        ></v-skeleton-loader>

        <v-btn
            v-if="initLoaded&&filterQuickAllowed"
            small
            :outlined="!config.filter.openQuickFilter"
            color="primary"
            class="mr-2"
            @click="openQuickfilterFn()">
          <v-icon v-if="!config.filter.openQuickFilter" small>mdi-filter</v-icon>
          <v-icon v-else small>mdi-filter-remove</v-icon>
        </v-btn>
        <v-menu v-model="showFilterMenu" v-show="initLoaded&&filterCustomerAllowed&&api.indexOf('/filter/')===-1" offset-y>
          <template v-slot:activator="{ on }">
            <v-btn
                v-show="initLoaded&&filterCustomerAllowed&&api.indexOf('/filter/')===-1"
                small
                   color="primary"
                   v-on="on"
                   :outlined="!config.userActiveFilter.id"
            >
              {{ $t('GRID.Filter.Title') }}
            </v-btn>
          </template>
          <v-list>
            <v-dialog v-model="dialogFilter"
                      persistent
                      fullscreen
                      hide-overlay
            >
              <template v-slot:activator="{ on }">
                <v-list-item dense v-on="on">
                  <v-list-item-title>
                    <v-icon dense>mdi-filter-plus</v-icon>
                    {{ $t('GRID.Filter.AddEdit') }}
                  </v-list-item-title>
                </v-list-item>
              </template>
              <UserFilter :items-per-page="config.filter.allowedRowsPerPage"
                          :grid-id="config.id"
                          :filter-list="config.userFilterList"
                          :api="api"
                          :loadID="dialogFilterId"
                          v-model="dialogFilter"
                          @updatefilterlist="updateUserFilterList"
                          @updatefilterlistClose="updatefilterlistClose"
                          ></UserFilter>
            </v-dialog>
            <v-divider></v-divider>

            <v-list-item-group v-model="config.userActiveFilter.id">
              <v-list-item dense :value="f.id"
                           v-for="f in config.userFilterList"
                           @click.native="applyFilter()"
                           :key="`filter-${f.id}`">
                <v-list-item-title>
                  {{ f.name }}
                </v-list-item-title>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>







































        <v-menu v-if="initLoaded&&config.export.length>0" offset-y>
          <template v-slot:activator="{ on }">
            <v-btn small
                   color="primary"
                   outlined
                   class="ml-2" export.length
                   v-on="on"
            >
              {{ $t('COMMON.Export') }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item dense @click="callExport(e.key)" :key="e.key" v-for="e in config.export">
              <v-list-item-title>
                <v-icon dense>{{ e.icon }}</v-icon>
                {{ e.name }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>


    <v-skeleton-loader
        v-if="vuetifyLoading&&!initLoaded"
        class="mt-4"
        type="table-thead, table-tbody"
    ></v-skeleton-loader>

    <slot :additional="additional" :initLoaded="initLoaded" name="BeforeTable"></slot>

    <!-- data grid -->
    <v-data-table
        :dense="dense"
        :footer-props="{'showFirstLastPage':true,'items-per-page-options': config.filter.allowedRowsPerPage,'items-per-page-text':$t('GRID.RowsPerPage'),'page-text':'{0}-{1} '+$t('GRID.XofY')+' {2}'}"
        :no-data-text="$t('GRID.NoData')"
        :loading-text="$t('GRID.LoadingData')"
        :loading="vuetifyLoading"
        :headers="headersNotHidden"
        :items="items"
        :server-items-length="itemsTotal"
        :options.sync="pagination"
        :group-by.sync="refreshHeader"
        class="elevation-1 gridTable"
        v-show="initLoaded"
        multi-sort
    >
      <template v-slot:group.header="{headers,group,groupBy, isOpen, toggle}">
        <th :colspan="headers.length">
          <v-icon @click="toggle"
          >{{ isOpen ? 'mdi-minus' : 'mdi-plus' }}
          </v-icon>
          {{groupBy[0]}}: {{group}}
        </th>
      </template>

      <template v-if="!config.filter.disable&&!config.filter.disableQuickFilter&&config.filter.openQuickFilter"
                v-slot:body.prepend="{ headers }">
        <tr>
          <td class="px-2" style="vertical-align: top;" v-for="header in headers">

            <!-- Normal fields -->
            <div v-if="!hasSelect(header)&&header.filterable&&header.type!=='Date'&&header.filterable&&header.type!=='DateTime'" >
              <v-text-field clearable @click:clear="addQuickfilterWithTimeout" @change="addQuickfilter" single-line dense
                            v-model="filter.values[header.name]"></v-text-field>
            </div>

            <!-- Select fields -->
            <div v-if="hasSelect(header)">
              <v-select :item-text="selectTextTranslation" @change="addQuickfilter" v-model="filter.values[header.name]" dense clearable :items="header.options.select[0].Items" ></v-select>
            </div>

            <!-- Date fields -->
           <input-date-time class="ma-2" dense single-line :from-to="true" v-if="header.filterable&&header.type==='Date'||header.filterable&&header.type==='DateTime'" @input="addQuickfilter" :field="header" v-model="filter.values[header.name]"></input-date-time>
          </td>
        </tr>
      </template>

      <!-- Table Items -->
      <template v-slot:item="{ index,item }">
        <tr :class="(typeof itemClass==='function'?itemClass(item):null)" style="white-space: nowrap;">
          <td class="pt-3" valign="top" v-for="header in headersNotHidden" :key="`item-${header.name}`">
            <div v-if="hasOwnView(header)">
              <component  v-model="item[header.name]" :additionalPass="additionalPass" :additional="additional" :config="config" :header="header" :parent="headers" :parent-data-orig="itemsOrig[index]" :parent-data="item" :api="api" :is="header.view"></component>
            </div>

            <div v-else-if="noEscaping(header)" v-html="item[header.name]">
            </div>

            <div v-else>
              {{ callbacks(item[header.name],header) }}
            </div>
            <div class="grid_action" v-if="header.value === 'grid_action' && showAction">
              <v-icon
                  v-if="config.update"
                  small
                  class="mr-2"
                  @click="editItem(item)"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                  v-if="config.delete"
                  @click="deleteItem(item)"
                  small
              >
                mdi-delete
              </v-icon>
            </div>
          </td>
          <td class="justify-center align-center layout px-0">
          </td>
        </tr>
      </template>

    </v-data-table>

  </v-flex>
</template>

<style>
.grid_action {
  white-space: nowrap;
}

.gridTable {
  margin-top: 15px;
}

.gridTable th {
  white-space: nowrap;
}

.readOnly {
  font-style: italic;
}

.v-data-table-header th {
  background-color: #e5e5e5;
}
</style>
