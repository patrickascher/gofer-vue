<script>
import {VBtn, VContainer, VFlex, VForm, VLayout, VTextField,} from 'vuetify/lib'
import {validationMixin} from 'vuelidate'
import {minLength, required} from 'vuelidate/lib/validators'
import {userService} from '../services/user'
import {ALERT} from "../store/modules/types";
import {store} from "../store";

export default {
  mixins: [validationMixin],
  components: {
    VContainer, VLayout, VFlex, VForm, VTextField, VBtn
  },
  data() {
    return {
      loading: false,
      config: {
        title: "",
        imgLogo: "",
        imgBg: "",
      },
      form: {
        username: '',
        password: ''
      },
    }
  },
  validations: {
    form: {
      password: {
        required,
        minLength: minLength(7)
      },
      username: {
        required
      }
    },
  },
  created() {
    this.config.imgBg = process.env.VUE_APP_BACKGROUND;
    this.config.imgLogo = process.env.VUE_APP_LOGO;

    if (userService.getUser() !== null) {
      this.$router.push(userService.redirectAfterLoginPath());
    }
  },
  computed: {
    passwordErrors() {
      const errors = []
      if (!this.$v.form.password.$dirty) return errors;
      !this.$v.form.password.minLength && errors.push(this.$t('COMMON.ErrPasswordLength'))
      !this.$v.form.password.required && errors.push(this.$t('COMMON.ErrPasswordRequired'))
      return errors
    }
    ,
    emailErrors() {
      const errors = []
      if (!this.$v.form.username.$dirty) return errors;
      !this.$v.form.username.required && errors.push(this.$t('COMMON.ErrLoginRequired'))
      return errors
    },
  },
  methods: {
    login: function () {
      this.loading = true;
      userService.login(this.form).then(() => {
        this.$router.push(userService.redirectAfterLoginPath());
      }).catch((error) => {
        store.commit('alert/' + ALERT.ERROR, error)
        // resetPasswordField
        this.form.password = '';
        this.$v.form.password.$reset();
        this.loading = false;
      }).then(() => {
        this.loading = false;
      });
    },
  }
}

</script>

<template>
  <v-container pa-0 fluid fill-height>
    <v-layout row>
      <v-flex xs12 md4>
        <div fill-height style="height:100%;background-color: #fff">
          <v-layout pa-2 justify-center align-center center row fill-height>
            <v-flex xs7>
              <div class="mb-5"><img style="width:100%" :src="require(`@/assets/${config.imgLogo}`)"/></div>
              <v-form class="pa-1">
                <v-text-field
                    v-model="form.username"
                    :label="$t('COMMON.Login')"
                    autocomplete="username"
                    :error-messages="emailErrors"
                    :placeholder="!autofilled ? ' ' : ''"
                    @input="$v.form.username.$touch()"
                ></v-text-field>
                <v-text-field
                    v-model="form.password"
                    :label="$t('COMMON.Password')"
                    type="password"
                    autocomplete="current-password"
                    :error-messages="passwordErrors"
                    :placeholder="!autofilled ? ' ' : ''"
                    @input="$v.form.password.$touch()"
                    @keyup.enter.native="login"
                ></v-text-field>

                <v-btn :disabled="!$v.form.username.$dirty || !$v.form.password.$dirty || $v.$anyError || loading"
                       @click="login(form)"
                       :loading="loading"
                       class="ma-0 pa-1 mt-3" style="width:100%" color="primary">
                  {{ $t('COMMON.Login') }}
                </v-btn>
                <div class="pt-4 grey--text" v-html="$t('COMMON.Privacy')"></div>
                <div style="position:absolute;bottom:0" v-html="$t('COMMON.Impress')">
                </div>
              </v-form>
            </v-flex>
          </v-layout>
        </div>
      </v-flex>

      <v-flex align-center hidden-sm-and-down xs8>
        <div align-center class="login-img"
             :style="{ backgroundImage: 'url('+require(`@/assets/${config.imgBg}`)+')' }">
          <div class="bg-overlay"></div>
          <v-layout align-center row fill-height>
            <v-flex style=" position: relative;" offset-md1 pr-4>
              <div style="width:400px;line-height: 1.0 !important;"
                   class="mb-4 font-weight-bold display-3 white--text">
                <h1 class="mb-2" style="font-size: 90px;color:#ffffff;line-height: 70px;font-weight: 900;">
                  {{ $t('APPLICATION.Name') }}</h1>
                <hr color="error"
                    style="border-radius:5px;height:6px;margin-bottom: 50px;width:80px;"></hr>
              </div>
              <div class="font-weight-light headline  white--text" v-html="$t('APPLICATION.Description')">
              </div>
            </v-flex>
          </v-layout>
        </div>
      </v-flex>

    </v-layout>
  </v-container>
</template>

<style>
.login-img {
  height: 100%;
  background-position: center center;
  background-size: cover;
  position: relative;
}

.bg-overlay {
  background-color: rgba(0, 0, 66, 0.9) !important;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: block;
  opacity: .2;
}
</style>
