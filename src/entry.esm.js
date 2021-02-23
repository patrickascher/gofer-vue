// Import vue components
import * as components from '@/lib-components/index';

// install function executed by Vue.use()
const install = function installGoferVue(Vue) {
    Object.entries(components).forEach(([componentName, component]) => {
        //console.log(componentName,component,options)

       // component.props["newa"]={ default: options.test }


        Vue.component(componentName, component);
    });

    /*
    install(Vue, options = {}) {
      let props = { ...MyComponent.props };
      Object.keys(options).forEach(k => {
        props[k] = { default: options[k] };
      });

      Vue.component('my-component', { ...MyComponent, props });
    }
    //Vue.use(MyComponent, {prop1:"abc", props:"def"});
     */
};

// Create module definition for Vue.use()
export default install;

// To allow individual component use, export components
// each can be registered via Vue.component()
export * from '@/lib-components/index';
