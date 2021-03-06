<script>
import {store} from '@/lib-components/store'
import {ALERT, NAVIGATION} from '@/lib-components/store/modules/types'
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
  VTextField
} from 'vuetify/lib'
import {http} from '@/lib-components/services/http'


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
    VIcon,
    VBtn,
    VFlex,
    VRow,
    VCol,
    VSkeletonLoader,
    VProgressLinear,
    VSpacer,
    VDataTable
  },
  props: {api: String},
  data() {
    return {
      refreshHeader: [], // needed for reloading the headers
      vuetifyLoading: true,
      vuetifyError: false,
      primaryKey: [],
      headers: [],


      // Items from the backend.
      items: [],
      itemsTotal: 0,
      // vuetify pagination object
      pagination: {},
      // filter data
      filter: {
        values: {},
        lastValues: {},
      },
      // backend config/default config will be generated
      config: {
        id: null,
        title: "",
        description: null,
        filter: {
          disable: null,
          disableQuickFilter: null,
          disableCustomFilter: null,
          openQuickFilter: null,
          allowedRowsPerPage: [],
          rowsPerPage: null,
        },
        export: [],
        activeFilter: {id: null, group: null, rowsPerPage: 0, sortby: [], sortdesc: []},
        create: true,
        detail: true,
        update: true,
        delete: true
      },
    }
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
        this.getData()
      }
    },
  },
  computed: {
    filterQuickAllowed() {

      console.log(this.config.filter)
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
      return this.config.filter.disableCustomFilter
    },
    initLoaded() {
      return this.headers.length !== 0
    },
    showAction() {
      return (this.config.details || this.config.update || this.config.delete)
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
        return typeof head.hide === 'undefined';
      })
    },

  },

  methods: {
    getValue(item, decorator) {
      if (!Array.isArray(item)) {
        item = [item]
      }

      let reg = /{{.*?}}/g;
      let matches = decorator.match(reg);
      let rv = []

      _.forEach(item, function (value) {
        let decor = decorator
        _.forEach(matches, function (match) {
          let id = match.replace("{{", "").replace("}}", "")
          if (_.get(value, id, false) !== false) {
            if (typeof value[id] === "object") {
              let tmpValue = []
              _.forEach(value[id], function (value) {
                tmpValue.push(value[Object.keys(value)[0]])
              });
              decor = decor.replace("{{" + id + "}}", tmpValue.join(", "))
              return false;
            }
            decor = decor.replace("{{" + id + "}}", value[id])
          } else {
            decor = decor.replace("{{" + id + "}}", "")
          }
        });
        rv.push(decor)
      });

      return rv.join("")
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
      window.open(process.env.VUE_APP_API + "/" + this.backendUrl(true) + "/mode/export/type/" + type);
    },
    /**
     * backendUrl is returning the backend api url with sort,filter and header information.
     */
    backendUrl(withHeader) {

      //head information
      let head = "";
      // no header information if it got already loaded
      if (withHeader !== true && this.items.length !== 0) {
        head = "/onlyData/1";
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
      if (this.config.activeFilter.id != null) {
        filter = "/filter/" + this.config.activeFilter.id
      }

      let filterCust = ""
      _.forEach(this.filter.values, function (value, index) {
        if (value !== null && value !== "") {
          filterCust += "/filter_" + index + "/" + value;
        }
      })

      return encodeURI(this.api + head + "/limit/" + this.pagination.itemsPerPage + "/page/" + this.pagination.page + order + filter + filterCust)
    },
    applyFilter() {
      // filter information
      // explicit set filter to 0 to avoid problems with an unchecked default filter
      //  let filter = "";
      //if (_.get(this.conf, 'activeFilter.id', false) === false) {
      // RESET group and sort
      this.pagination.sortBy = []
      this.pagination.sortDesc = []
      this.pagination.groupBy = []
      this.pagination.groupDesc = []
      this.pagination.itemsPerPage = 10
      //}

      this.getData()
    },
    addQuickfilter() {
      if (!_.isEqual(this.filter.values, this.filter.lastValues)) {
        this.getData() //no header- before with header, check why?
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
      http.get(this.backendUrl(withHeader)).then((resp) => {


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
          this.config.description = _.get(resp.data, "config.description", "")
          this.config.create = !_.get(resp.data, "config.action.disableCreate", false)
          this.config.detail = !_.get(resp.data, "config.action.disableDetail", false)
          this.config.update = !_.get(resp.data, "config.action.disableUpdate", false)
          this.config.delete = !_.get(resp.data, "config.action.disableDelete", false)

          // filter
          this.config.filter.rowsPerPage, this.pagination.itemsPerPage = _.get(resp.data, "config.filter.rowsPerPage", false)
          this.config.filter.allowedRowsPerPage = _.get(resp.data, "config.filter.allowedRowsPerPage", [5, 10, 15, 25, 50, 100, 500])
          this.config.filter.openQuickFilter = _.get(resp.data, "config.filter.openQuickFilter", false)
          this.config.filter.disable = _.get(resp.data, "config.filter.disable", false)
          this.config.filter.disableCustomFilter = _.get(resp.data, "config.filter.disableCustomFilter", false)
          this.config.filter.disableQuickFilter = _.get(resp.data, "config.filter.disableQuickFilter", false)
        }


        //TODO reform:

        // adding total items
        if (_.get(resp.data, "pagination.Total", false) !== false) {
          this.itemsTotal = resp.data.pagination.Total;
        }

        if (_.get(resp.data, "config", false) !== false) {
          // user filters
          if (_.get(resp.data, "config.filter.list", false) !== false) {
            this.config.filter = resp.data.config.filter.list
          }
          if (_.get(resp.data, "config.filter.active", false) !== false) {

            if (_.get(resp.data, "config.filter.active.group", false) !== false) {
              this.pagination.groupBy = [resp.data.config.filter.active.group]
              this.pagination.groupDesc = [false]
            }

            if (_.get(resp.data, "config.filter.active.rowsPerPage", false) !== false) {
              this.pagination.itemsPerPage = resp.data.config.filter.active.rowsPerPage
            }

            if (this.config.activeFilter.id !== resp.data.config.filter.active.id) {
              this.config.activeFilter.id = resp.data.config.filter.active.id
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
            this.headers.unshift({text: "Action", align: "end", sortable: false, value: "grid_action"})
          } else {
            this.headers.push({text: "Action", width: 1, sortable: false, value: "grid_action"})
          }

        }

        if (this.headers.length > 0) {
          for (let i = 0; i < this.headers.length; i++) {
            // callback decorator
            if (_.get(this.headers[i], "options.decorator", false) !== false) {
              let head = this.headers[i]
              let _this = this;
              // add no escaping
              if (_this.headers[i].options.decorator[1] === true) {
                _this.headers[i].options['noEscaping'] = [true]
              }
              _.forEach(resp.data.data, function (value, index) {
                if (resp.data.data[index][head.name] === null) {
                  return;
                }
                resp.data.data[index][head.name] = _this.getValue(resp.data.data[index][head.name], _this.headers[i].options.decorator[0])
              });
            }

            // select value with items
            if (_.get(this.headers[i], "options.select.Items", false) !== false) {
              let head = this.headers[i]
              let _this = this;
              _.forEach(resp.data.data, function (value, index) {
                if (resp.data.data[index][head.name] === null) {
                  return;
                }
                _.forEach(_this.headers[i].options.select.Items, function (v) {
                  if (v.value === resp.data.data[index][head.name]) {
                    resp.data.data[index][head.name] = v.text
                  }
                });
              });
            }

          }
        }

        this.vuetifyLoading = false; // reset vuetify loading indicator

        // set the items
        this.items = (resp.data.data == null) ? [] : resp.data.data;


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
      if (confirm(this.$t('GRID.DeleteItem'))) {
        http.delete(this.api + this.urlWithPrimaryParam(item)).then(() => {
          //delete item
          const index = this.items.indexOf(item);
          this.items.splice(index, 1);

          //show alert
          store.commit('alert/' + ALERT.SUCCESS, this.$t('GRID.ItemDeleted'));

          //refresh
          this.getData()
        });
      }
    },
    /**
     * editItem by item
     */
    editItem(item) {
      this.$router.push(this.$route.path + "/mode/update" + this.urlWithPrimaryParam(item));
    },
  }
}

</script>

<template>
  <v-flex>

    <v-row>
      <v-col cols="auto"
             class="mr-auto">

        <v-skeleton-loader
            v-if="vuetifyLoading&&!initLoaded"
            width="300"
            class="mt-4"
            type="text"
        ></v-skeleton-loader>
        <h1 v-if="initLoaded">{{ config.title }}</h1>

        <v-progress-linear
            v-if="!initLoaded"
            indeterminate
            color="grey"
            style="border-radius:5px;height:6px;width:50px;"
        ></v-progress-linear>
        <hr v-if="initLoaded&&config.title!=''" color="error" style="border-radius:5px;height:6px;width:50px;"/>
        <p v-if="initLoaded">{{ config.description }}</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="2">
        <v-skeleton-loader
            v-if="vuetifyLoading&&!initLoaded"
            max-width="300"
            max-height="20"
            type="button"
        ></v-skeleton-loader>

        <v-btn
            v-if="config.create&&(!vuetifyLoading||initLoaded)"
            color="primary"
            small
            class="mr-2"
            :to="$route.path + '/mode/create'"
        >
          {{ $t('GRID.Add') }}
        </v-btn>
      </v-col>
      <v-spacer cols="1"></v-spacer>
      <v-col cols="9" align="end">
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
            @click="config.filter.openQuickFilter=!config.filter.openQuickFilter">
          <v-icon small>mdi-filter</v-icon>
        </v-btn>

        <v-menu v-if="initLoaded&&config.export.length>0" offset-y>
          <template v-slot:activator="{ on }">
            <v-btn small
                   color="primary"
                   outlined
                   class="mr-2" export.length
                   v-on="on"
            >
              {{ $t('GRID.Export') }}
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

    <!-- data grid -->
    <v-data-table
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

      <template v-if="!config.filter.disable&&!config.filter.disableQuickFilter&&config.filter.openQuickFilter" v-slot:body.prepend="{ headers }">
        <tr>
          <td class="px-2" v-for="header in headers">
            <v-text-field @change="addQuickfilter" v-if="header.filterable" single-line dense
                          v-model="filter.values[header.name]"></v-text-field>
          </td>
        </tr>
      </template>

      <!-- Table Items -->
      <template v-slot:item="{ item }">
        <tr style="white-space: nowrap;">
          <td class="pt-3" valign="top" v-for="header in headersNotHidden" :key="`item-${header.name}`">

            <div v-if="hasOwnView(header)">
              <component v-model="item[header.name]" :is="header.view"></component>
            </div>

            <div v-else-if="noEscaping(header)" v-html="item[header.name]"
                 v-else>
            </div>

            <div v-else>
              {{ item[header.name] }}
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
