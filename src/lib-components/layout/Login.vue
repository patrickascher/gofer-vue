<script>
import {
  VBtn,
  VContainer,
  VFlex,
  VForm,
  VLayout,
  VTab,
  VTabItem,
  VTabs,
  VTabsItems,
  VTabsSlider,
  VTextField
} from 'vuetify/lib'
import {validationMixin} from 'vuelidate'
import {minLength, required, sameAs} from 'vuelidate/lib/validators'
import {userService} from '../services/user'
import {ALERT} from "../store/modules/types";
import {store} from "../store";
import Config from '../services/config'

export default {
  mixins: [validationMixin],
  components: {
    VContainer, VLayout, VFlex, VForm, VTabs, VTab, VTabsItems, VTabItem, VTextField, VBtn, VTabsSlider
  },
  data() {
    return {
      provider: null,
      config: Config.get(),
      loading: false,
      showForgotPassword: false,
      showChangePassword: false,
      form: {
        username: '',
        password: ''
      },
      formForgotPassword: {
        username: '',
      },
      formChangePassword: {
        token: '',
        username: '',
        password: '',
        passwordConfirm: '',
      },
    }
  },
  validations: {
    form: {
      password: {
        required,
        minLength: minLength(6)
      },
      username: {
        required
      }
    },
    formForgotPassword: {
      username: {
        required
      }
    },
    formChangePassword: {
      password: {
        required,
        minLength: minLength(6)
      },
      passwordConfirm: {
        required,
        minLength: minLength(6),
        sameAsPassword: sameAs('password'),
      }
    }
  },
  created() {
    // set config.
    this.config = Config.get()

    // show reset password form.
    if (typeof this.$route.params.token !== "undefined") {
      this.showChangePassword = true;
      this.showForgotPassword = false;
      this.provider = this.$route.params.provider;
      this.formChangePassword.token = this.$route.params.token;
      this.formChangePassword.username = this.$route.params.login;
    }

    // redirect after login path if user is already logged-in.
    if (userService.getUser() !== null) {
      this.$router.push(userService.redirectAfterLoginPath());
    }
  },
  computed: {
  // darkmode - create a better solution for it
   darkClassMode() {
       if (!this.config.webserver.app.bgDark){
         return "font-weight-light headline"
       }
       return "font-weight-light headline white--text"
   },
    darkClassModeHeadline() {
          if (!this.config.webserver.app.bgDark){
            return "mb-4 font-weight-bold display-3"
          }
          return "mb-4 font-weight-bold display-3 white--text"
      },
    forgotPasswordDisabled() {
      return !_.get(this.config, 'webserver.auth.providers.' + this.provider + '.forgotpassword', false)
    },
    changePasswordDisabled() {
      return !_.get(this.config, 'webserver.auth.providers.' + this.provider + '.changepassword', false)
    }
  },
  methods: {
    passwordErrors(form, field) {
      const errors = []
      if (!this.$v[form][field].$dirty) return errors;
      !this.$v[form][field].minLength && errors.push(this.$t('CONTROLLER.auth.Controller.Login.ErrPasswordLength'))
      !this.$v[form][field].required && errors.push(this.$t('CONTROLLER.auth.Controller.Login.ErrPasswordRequired'))
      // set error message if password does not match
      if (field === "passwordConfirm" && this.formChangePassword.password !== this.formChangePassword.passwordConfirm) {
        errors.push(this.$t('CONTROLLER.auth.Controller.Login.ErrPasswordMatch'))
      }
      return errors
    },
    usernameErrors(form, field) {
      const errors = []
      if (!this.$v[form][field].$dirty) return errors;
      !this.$v[form][field].required && errors.push(this.$t('CONTROLLER.auth.Controller.Login.ErrLoginRequired'))
      return errors
    },
    resetForm: function () {
      this.form.username = '';
      this.form.password = '';
      this.$v.form.username.$reset();
      this.$v.form.password.$reset();

      this.formForgotPassword.username = '';
      this.$v.formForgotPassword.username.$reset();

      this.formChangePassword.password = '';
      this.formChangePassword.passwordConfirm = '';
      this.$v.formChangePassword.password.$reset();
      this.$v.formChangePassword.passwordConfirm.$reset();
    },
    changePassword: function () {
      this.loading = true;
      userService.changePassword(this.formChangePassword, this.provider).then((resp) => {
        this.resetForm()
        store.commit('alert/' + ALERT.SUCCESS, this.$t('CONTROLLER.' + this.provider + '.ChangePassword.Success')) // only native can change passwords.
        this.loading = false;
        // set default username, so only the pw has to get entered.
        this.form.username = this.$route.params.login;
        this.$v.form.username.$touch()
        this.$router.push('/')
        this.showChangePassword = !this.showChangePassword
      }).catch((error) => {
        store.commit('alert/' + ALERT.ERROR, error)
        this.resetForm()
        this.loading = false;
        this.$router.push('/')
        this.showChangePassword = !this.showChangePassword
      })
    },
    forgotPassword: function () {
      this.loading = true;
      userService.forgotPassword(this.formForgotPassword, this.provider).then((resp) => {
        this.resetForm()
        store.commit('alert/' + ALERT.SUCCESS, this.$t('CONTROLLER.' + this.provider + '.ForgotPassword.Success'))
        this.showForgotPassword = !this.showForgotPassword
        this.loading = false;
      }).catch((error) => {
        store.commit('alert/' + ALERT.ERROR, error)
        this.resetForm()
        this.loading = false;
      })
    },
    login: function () {
      this.loading = true;
      userService.login(this.form, this.provider).then(() => {
        this.resetForm()
        this.$router.push(userService.redirectAfterLoginPath());
        this.loading = false;
      }).catch((error) => {
        store.commit('alert/' + ALERT.ERROR, error)
        // resetPasswordField
        this.form.password = '';
        this.$v.form.password.$reset();
        this.loading = false;
      })
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
              <div class="mb-5"><img style="width:100%" :src="require(`@/assets/${config.webserver.app.logo}`)"/></div>

              <!--
              Provider selector
              -->
              <v-tabs
                  v-model="provider"
                  grow
                  centered
                  v-show="Object.keys(config.webserver.auth.providers).length>1"
              >
                <v-tab v-for="(v,i) in config.webserver.auth.providers" :href="`#${i}`">
                  {{ i }}
                </v-tab>
              </v-tabs>

              <!--
              Login form
              -->
              <v-form v-if="!showForgotPassword&&!showChangePassword" class="pa-1">
                <v-text-field
                    v-model="form.username"
                    :label="$t('COMMON.Login')"
                    autocomplete="username"
                    :error-messages="usernameErrors('form','username')"
                    @input="$v.form.username.$touch()"
                ></v-text-field>
                <v-text-field
                    v-model="form.password"
                    :label="$t('COMMON.Password')"
                    type="password"
                    :error-messages="passwordErrors('form','password')"
                    @input="$v.form.password.$touch()"
                    @keyup.enter.native="login"
                ></v-text-field>
                <v-btn :disabled="!$v.form.username.$dirty || !$v.form.password.$dirty || $v.form.$anyError || loading"
                       @click="login(form)"
                       :loading="loading"
                       class="ma-0 pa-1 mt-3" style="width:100%" color="primary">
                  {{ $t('COMMON.Login') }}
                </v-btn>
                <div class="pt-4 grey--text">
                  <a href="#"
                     v-on:click="showForgotPassword = !showForgotPassword">{{
                      $t('CONTROLLER.auth.Controller.Login.ForgotPassword')
                    }}</a>
                </div>
                <div class="pt-4 grey--text" v-html="$t('CONTROLLER.auth.Controller.Login.Privacy')"></div>
                <div style="position:absolute;bottom:0" v-html="$t('CONTROLLER.auth.Controller.Login.Impress')">
                </div>
              </v-form>


              <!--
              Forgot password form
              -->
              <v-form v-show="showForgotPassword" class="pa-1">
                <v-text-field
                    v-model="formForgotPassword.username"
                    :label="$t('COMMON.Login')"
                    :error-messages="usernameErrors('formForgotPassword','username')"
                    :disabled="forgotPasswordDisabled"
                    @input="$v.formForgotPassword.username.$touch()"
                ></v-text-field>
                <v-btn
                    :disabled="forgotPasswordDisabled || !$v.formForgotPassword.username.$dirty || $v.formForgotPassword.$anyError ||loading"
                    @click="forgotPassword(formForgotPassword)"
                    :loading="loading"
                    class="ma-0 pa-1 mt-3" style="width:100%" color="primary">
                  {{ $t('COMMON.Reset') }}
                </v-btn>
                <div class="pt-4 grey--text">
                  {{ $t('CONTROLLER.' + provider + '.ForgotPassword.Info') }}
                </div>
                <div class="pt-4 grey--text">
                  <a href="#"
                     v-on:click="showForgotPassword = !showForgotPassword; formForgotPassword.username = ''; $v.formForgotPassword.username.$reset();">
                    {{ $t('COMMON.Back') }}</a>
                </div>
              </v-form>


              <!--
              Change password form
              -->
              <v-form v-show="showChangePassword" class="pa-1">
                <v-text-field
                    v-show="false"
                    type="hidden"
                    v-model="formChangePassword.username"
                ></v-text-field>
                <v-text-field
                    v-show="false"
                    type="hidden"
                    v-model="formChangePassword.token"
                ></v-text-field>
                <v-text-field
                    type="password"
                    :disabled="changePasswordDisabled"
                    v-model="formChangePassword.password"
                    :label="$t('COMMON.Password')"
                    :error-messages="passwordErrors('formChangePassword','password')"
                    @input="$v.formChangePassword.password.$touch()"
                ></v-text-field>
                <v-text-field
                    type="password"
                    :disabled="changePasswordDisabled"
                    v-model="formChangePassword.passwordConfirm"
                    :label="$t('COMMON.PasswordConfirm')"
                    :rules="confirmPasswordRules"
                    :error-messages="passwordErrors('formChangePassword','passwordConfirm')"
                    @input="$v.formChangePassword.passwordConfirm.$touch()"
                ></v-text-field>
                <v-btn
                    :disabled="changePasswordDisabled || !$v.formChangePassword.password.$dirty || $v.formChangePassword.$anyError || !$v.formChangePassword.passwordConfirm.$dirty ||loading"
                    @click="changePassword(formChangePassword)"
                    :loading="loading"
                    class="ma-0 pa-1 mt-3" style="width:100%" color="primary">
                  {{ $t('COMMON.Save') }}
                </v-btn>
                <div class="pt-4 grey--text">
                  {{ $t('CONTROLLER.' + provider + '.ChangePassword.Info') }}
                </div>
                <div class="pt-4 grey--text">
                  <a href="#" v-on:click="$router.push('/');showChangePassword=!showChangePassword">
                    {{ $t('COMMON.Back') }}</a>
                </div>
              </v-form>
            </v-flex>
          </v-layout>
        </div>
      </v-flex>

      <v-flex align-center hidden-sm-and-down xs8 class="login-img"
              :style="{ backgroundImage: 'url('+require(`@/assets/${config.webserver.app.bgImg}`)+')' }">
        <div align-center style="height:100%">
          <v-layout align-center row fill-height>
            <v-flex style=" position: relative;" offset-md1 pr-4>
              <div style="width:400px;line-height: 1.0 !important;"
                   :class="darkClassModeHeadline">
                <h1 class="mb-2" style="font-size: 90px;line-height: 70px;font-weight: 900;">
                  {{ config.webserver.app.name }}</h1>
                <hr color="error"
                    style="border-radius:5px;height:6px;margin-bottom: 50px;width:80px;"/>
              </div>
              <div :class="darkClassMode"
                   v-html="$t('CONTROLLER.auth.Controller.Login.Description')">
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
</style>
