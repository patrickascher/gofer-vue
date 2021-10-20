<script>
import {VCard, VFileInput, VIcon, VList, VListItem, VListItemGroup, VSubheader} from 'vuetify/lib'
import InputBase from '@/lib-components/grid/inputs/Base'
import {validation} from '@/lib-components/grid/mixins/validation'
import UploadService from '@/lib-components/services/upload'
import {store} from "@/lib-components/store";
import {ALERT} from "@/lib-components/store/modules/types";

export default {
  components: {VFileInput, VCard, VList, VSubheader, VListItemGroup, VListItem, VIcon},
  props: ['api', 'field'],
  extends: InputBase,
  mixins: [validation],
  mounted() {
    this.get()
  },
  methods: {
    selectFiles(files) {
      this.progressInfos = [];
      // multiple tag.
      if (Array.isArray(files) === false) {
        this.selectedFiles = [files]
      } else {
        this.selectedFiles = files;
      }
      this.uploadFiles();
    },
    deleteFile(filename) {
      UploadService.deleteFile(this.url(), filename).then((response) => {
        if (Array.isArray(this.fieldValue) === false) {
          this.fieldValue = null; // []
        } else {
          this.fieldValue = null; // {}
        }
      }).catch((error) => {
        store.commit('alert/' + ALERT.ERROR, error);
      });
    },
    uploadFiles() {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i]);
      }
    },
    url() {
      return this.api.replace("mode/update/", "mode/callback/").replace("mode/create", "mode/callback") + "/callback/upload/f/" + this.field.name
    },
    upload(idx, file) {
      this.progressInfos[idx] = {percentage: 0, fileName: file.name};
      UploadService.upload(this.url(), file, (event) => {
        this.progressInfos[idx].percentage = Math.round(100 * event.loaded / event.total);
      })
          .then((response) => {
            store.commit('alert/' + ALERT.SUCCESS, this.$t('GRID.Uploaded'));
            this.fieldValue = response.data.data
          })
          .catch((error) => {
            this.progressInfos[idx].percentage = 0;
            store.commit('alert/' + ALERT.ERROR, error);
          });
    }
  },
  data() {
    return {
      selectedFiles: undefined,
      progressInfos: [],
      message: "",
      fileInfos: [],
    }
  }
}
</script>

<template>
  <div>
    <v-file-input
        counter
        show-size
        small-chips
        truncate-length="15"
        @change="selectFiles"
    ></v-file-input>
    <v-card v-if="fieldValue!==null&&fieldValue.ID!==0" class="mx-auto">
      <v-list>
        <v-subheader>List of Files</v-subheader>
        <v-list-item-group color="primary">
          <v-list-item>
            {{ fieldValue.Type }} {{ fieldValue.Size }}
            <v-icon @click="deleteFile(fieldValue.Name)" small>mdi-delete</v-icon>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>

  </div>
</template>
