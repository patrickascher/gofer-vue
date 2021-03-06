<script>
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VCol,
  VContainer,
  VDialog,
  VExpansionPanel,
  VExpansionPanelContent,
  VExpansionPanelHeader,
  VExpansionPanels,
  VFlex,
  VProgressCircular,
  VProgressLinear,
  VRow,
  VSelect,
  VSimpleTable,
  VSkeletonLoader,
  VSpacer,
  VTab,
  VTabs,
  VTextField,
  VTooltip
} from 'vuetify/lib'
import {http} from '../services/http'
import {i18nService} from '../services/i18n'
import {store} from "../store";
import {ALERT} from "../store/modules/types";
import {isEqual} from "lodash";

export default {
  components: {
    VFlex,
    VRow,
    VCol,
    VTab,
    VTabs,
    VSkeletonLoader,
    VProgressLinear,
    VDialog,
    VBtn,
    VCard,
    VCardTitle,
    VContainer,
    VSelect,
    VCardText,
    VCardActions,
    VSpacer,
    VExpansionPanel,
    VExpansionPanels,
    VExpansionPanelHeader,
    VProgressCircular,
    VExpansionPanelContent,
    VSimpleTable,
    VTextField,
    VTooltip
  },
  data() {
    return {
      // separator for the grouping.
      separator: ".",

      // language dialog.
      dialog: false,
      dialogValue: null,

      // loading and changes declarations.
      changed: false,
      initLoaded: false,
      loading: false,

      // tab settings.
      tabIndex: 0,
      activeTab: 0,
      panelSwitch: null,

      // raw messages.
      rawMessages: [],
      // translated - languages which are already defined.
      translated: [],
      // languages - all available languages.
      languages: [],
      // groups - translation groups.
      groups: [],
      // items - holds the db translation model.
      items: {},
      // snapshotItems - check changes against items.
      snapshotItems: {},
    }
  },
  mounted() {
    this.getOverview();
  },
  watch: {
    panelSwitch: function () {
      if (typeof this.panelSwitch !== "undefined") {
        this.tabIndex = -1
      }
    },
    tabIndex: function () {
      if (this.tabIndex === -1) {
        return
      }
      if (typeof this.activeTab !== "undefined") {
        this.getTranslationGroup(this.translated[this.panelSwitch].BCP, this.tabIndex)
        this.activeTab = this.tabIndex
      } else {
        this.loading = false;
      }
    },
  },
  computed: {
    /**
     * groupItems - creates an additional grouping option if the separator is used a second time.
     * special case, with controllers, then the first two separator are used as group name.
     */
    groupItems: function () {

      let group = [{"Group": "", "Items": []}]
      let groupName = ""
      let _this = this
      _.forEach(this.items, function (value, index) {

        let s = value.MessageID.split(_this.separator);

        // no additional separator.
        if (s.length <= 2) {
          group[0].Items.push(index)
          return
        }

        // additional separator.
        if (s.length > 2 && (groupName === "" || groupName !== s[1])) {
          groupName = s[1] + _this.separator
          if (s.length === 4) { // controller
            groupName = s[1] + _this.separator + s[2] + _this.separator
          }
          let exists = false
          _.forEach(group, function (value) {
            if (value.Group === groupName) {
              exists = true
              return false
            }
          });
          if (exists === false) {
            group.push({"Group": groupName, "Items": []})
          }
        }

        // push items to group.
        _.forEach(group, function (value) {
          if (value.Group === groupName) {
            value.Items.push(index)
            return false
          }
        });
      });

      return group
    },
  },
  methods: {
    /**
     * hasChanged - detects if one of the items has changes.
     * It`s used for disabling the save button.
     */
    hasChanged(index) {
      if (this.items[index].Other === "") {
        this.items[index].Other = null
      }
      this.changed = !isEqual(this.items, this.snapshotItems)
    },
    /**
     * getOverview - fetches the overview for the translation.
     */
    getOverview() {
      this.loading = true;
      http.get(this.$route.meta.api + "/mode/overview").then((resp) => {
        // set data
        this.translated = resp.data.translated;
        this.languages = resp.data.languages;
        this.rawMessages = resp.data.rawMessages;
        this.groups = resp.data.groups;

        this.loading = false;
        this.initLoaded = true;
      }).catch((error) => {
        store.commit('alert/' + ALERT.ERROR, error);
        this.loading = false;
        this.initLoaded = true;
      });
    },
    /**
     * addLanguage - will add a new translation bundle.
     * It will only manipulate the translated array but not save anything yet.
     */
    addLanguage() {
      if (this.translated === null) {
        this.translated = []
      }
      this.translated.push({
        BCP: this.dialogValue.BCP,
        EnglishName: this.dialogValue.EnglishName,
        SelfName: this.dialogValue.SelfName,
        Translated: 0
      })
      this.dialog = false;
      this.dialogValue = null;
      this.panelSwitch = this.translated.length - 1;
    },
    /**
     * saveLanguage - will save the actual language group tab.
     */
    saveLanguage(lang, group) {
      this.loading = true;

      http.request({
        url: this.$route.meta.api + "/lang/" + lang + "/group/" + group,
        method: "PUT",
        data: this.items
      }).then((resp) => {
        store.commit('alert/' + ALERT.SUCCESS, "Translation " + lang.toUpperCase() + " - " + this.groups[group].toUpperCase() + " saved!");
        this.loading = false;
        this.translated = resp.data.translated;
        this.generateItems(resp.data.translation);

        // reload lang file if the actual locale got changed.
        if (lang === i18nService.i18n.locale) {
          i18nService.loadLanguageAsync(lang, true)
        }

      }).catch((error) => {
        this.loading = false;
        store.commit('alert/' + ALERT.ERROR, error);
      });
    },
    /**
     * deleteLanguage - will delete a whole translation bundle.
     * After a delete the overview will be reloaded.
     */
    deleteLanguage(lang) {

      if (confirm(this.$t('COMMON.DeleteItem'))) {
        this.loading = true;
        http.request({
          url: this.$route.meta.api + "/lang/" + lang,
          method: "DELETE",
          data: this.items
        }).then(() => {
          store.commit('alert/' + ALERT.SUCCESS, "Translation (" + lang.toUpperCase() + ") deleted!");
          this.getOverview()
        }).catch((error) => {
          store.commit('alert/' + ALERT.ERROR, error);
          this.loading = false;
        });
      }
    },
    /**
     * languageSelect - will return all available languages, which are not defined yet.
     */
    languageSelect() {
      return this.languages.filter(lang => {

        let exist = false
        _.forEach(this.translated, function (value) {
          if (value.BCP === lang.BCP) {
            exist = true;
            return false;
          }
        });

        return !exist
      })
    },
    /**
     * getRawByMessageID - will return the raw message.
     * Used to display it as input label.
     */
    getRawByMessageID(id) {
      let msg = ""
      _.forEach(this.rawMessages, function (value) {
        if (value.MessageID === id) {
          msg = value;
          return false
        }
      });
      return msg
    },
    /**
     * getRawWithPrefix - will load all raw messages for the given prefix.
     */
    getRawWithPrefix(prefix) {
      return this.rawMessages.filter(raw => {
        return raw.MessageID.startsWith(prefix)
      })
    },
    /**
     * generateItems - will generate the items by the raw messages and db entries.
     */
    generateItems(translations) {
      let tmpItems = JSON.parse(JSON.stringify(this.getRawWithPrefix(this.groups[this.activeTab]))); // Object.assign({}, this.item); has no deep copy
      _.forEach(tmpItems, function (value, index) {
        tmpItems[index].Description = undefined;
        let exist = false
        _.forEach(translations, function (dbValue) {
          if (value.MessageID === dbValue.MessageID) {
            tmpItems[index] = dbValue
            exist = true
          }
        });
        if (!exist) {
          tmpItems[index].ID = 0
          tmpItems[index].Other = null
        }
      });
      this.items = JSON.parse(JSON.stringify(tmpItems)); // Object.assign({}, this.item); has no deep copy
      this.snapshotItems = JSON.parse(JSON.stringify(tmpItems)); // Object.assign({}, this.item); has no deep copy
      this.hasChanged(0)
    },
    /**
     * getTranslationGroup - will load the translation by lang and group.
     */
    getTranslationGroup(lang, group) {
      this.loading = true;
      http.get(this.$route.meta.api + "/lang/" + lang + "/group/" + group).then((resp) => {
        this.generateItems(resp.data.translation)
        this.changed = false;
        this.loading = false;
      }).catch((error) => {
        this.loading = false;
        store.commit('alert/' + ALERT.ERROR, error);
      });
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
            v-if="!initLoaded"
            width="300"
            class="mt-4"
            type="text"
        ></v-skeleton-loader>
        <h1 v-if="initLoaded">{{ $t('CONTROLLER.locale.Controller.Title') }}</h1>
        <v-progress-linear
            v-if="!initLoaded"
            indeterminate
            color="grey"
            style="border-radius:5px;height:6px;width:50px;"
        ></v-progress-linear>
        <hr v-if="initLoaded" color="error" style="border-radius:5px;height:6px;width:50px;"/>
        <p v-if="initLoaded">{{ $t('CONTROLLER.locale.Controller.Description') }}</p>

      </v-col>
    </v-row>

    <v-row>
      <v-col cols="auto">
        <v-skeleton-loader
            v-if="!initLoaded"
            max-width="300"
            max-height="20"
            type="button"
        ></v-skeleton-loader>

        <v-dialog v-if="initLoaded" v-model="dialog" persistent max-width="300px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                v-bind="attrs"
                v-on="on"
                small
                class="mb-3"
            >
              {{ $t('CONTROLLER.locale.Controller.AddLanguage') }}
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ $t('CONTROLLER.locale.Controller.AddLanguage') }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col>
                    <v-select
                        :items="languageSelect()"
                        item-value="BCP"
                        item-text="EnglishName"
                        :label="$t('COMMON.Language')"
                        v-model="dialogValue"
                        return-object
                        required
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" outlined @click="dialog = false">{{ $t('COMMON.Close') }}</v-btn>
              <v-btn color="primary" @click.native="addLanguage()">{{ $t('COMMON.Add') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>

    <v-skeleton-loader
        v-if="loading&&translated.length===0"
        class="mt-4"
        type="table-row-divider@4"
    ></v-skeleton-loader>

    <v-expansion-panels focusable v-model="panelSwitch" :disabled="loading">
      <v-expansion-panel
          v-for="translation in translated"
          :key="translation.BCP"
      >
        <v-expansion-panel-header v-slot="{ open }">
          <v-row>
            <v-col cols="5">{{ $t('COMMON.Language') }}: {{ translation.EnglishName }}
              ({{ translation.SelfName }})
            </v-col>
            <v-col class="text--secondary" cols="5">BCP 47: {{ translation.BCP }}</v-col>
            <v-col class="text--secondary" cols="2">
              <v-progress-circular
                  size="40"
                  width="5"
                  :value="Math.round((translation.Translated/rawMessages.length)*100)"
                  color="primary"
              >{{ Math.round((translation.Translated / rawMessages.length) * 100) }}%
              </v-progress-circular>
            </v-col>
          </v-row>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <template>
            <v-tabs v-model="tabIndex">
              <v-tab :disabled="loading" :key="group"
                     v-for="group in groups">
                {{ group }}
              </v-tab>
            </v-tabs>
          </template>
          <div class="text-center" v-if="loading">
            <v-progress-circular
                indeterminate
                color="primary"
            ></v-progress-circular>
          </div>

          <div v-if="!loading">
            <v-simple-table>
              <template v-slot:default>
                <thead>
                <tr>
                  <th class="text-left">{{ $t('CONTROLLER.locale.Controller.ID') }}</th>
                  <th class="text-left">{{ $t('CONTROLLER.locale.Controller.Translation') }}</th>
                </tr>
                </thead>
                <tbody>

                <slot v-for="group in groupItems">

                  <tr style="background-color:#eee" v-if="group.Group!==''">
                    <td colspan="2"><h4>{{ group.Group.slice(0, -1) }}</h4></td>
                  </tr>

                  <tr v-for="index in group.Items">
                    <td>{{ items[index].MessageID.replace(groups[activeTab] + separator, "").replace(group.Group, "") }}<br/><span
                        class="text--secondary"
                        style="font-size: 12px;">{{ getRawByMessageID(items[index].MessageID).Description }}</span>
                    </td>
                    <td>
                      <v-text-field @keyup="hasChanged(index)"
                                    :label="getRawByMessageID(items[index].MessageID).Other"
                                    v-model="items[index].Other">
                      </v-text-field>
                    </td>
                  </tr>
                </slot>

                </tbody>
              </template>
            </v-simple-table>

            <v-row class="mt-5 r-3 ml-3" justify="space-between">

              <v-btn
                  :loading="loading"
                  @click="deleteLanguage(translated[panelSwitch].BCP)"
                  color="error"
                  outlined
                  small
                  class="mb-3"
              >
                {{ $t('COMMON.Delete') }}
              </v-btn>

              <!-- Save Button -->
              <v-tooltip left>
                <template v-slot:activator="{ on }">
                  <div v-on="!changed?on:null">
                    <v-btn justify="end"
                           small
                           :loading="loading"
                           :disabled="!changed"
                           @click="saveLanguage(translated[panelSwitch].BCP, tabIndex)"
                           color="primary"
                           class="mb-3"
                    >
                      {{ $t('COMMON.Save') }}
                    </v-btn>
                  </div>
                </template>
                <span v-if="!changed">{{ $t('COMMON.NoChanges') }}</span>
              </v-tooltip>

            </v-row>

          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-flex>
</template>
