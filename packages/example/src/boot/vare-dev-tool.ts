import {boot} from 'quasar/wrappers'
import {Plugin, createApp, defineComponent} from 'vue'
import {setupDevtoolsPlugin} from '@vue/devtools-api'

export interface DevToolOptions {
  id?: string
}

const DevAppComponent = defineComponent({
  name: 'dev-app-component',
})

const createVareDevTool = (): Plugin => {
  const devApp = createApp(DevAppComponent)

  return {
    install(app, options: DevToolOptions = {}) {
      const {id = '__vare__'} = options

      app.mixin({
        beforeCreate() {
          // run only in root
          if (this.$root !== this) {
            return
          }
          console.log('foo??')
          if (typeof window === 'undefined') {
            return
          }

          const vareDom = document.createElement('div')

          vareDom.id = id

          document.body.append(vareDom)

          devApp.mount(vareDom)

          setupDevtoolsPlugin({
            id: 'com.npmjs.packages.vare',
            label: 'vare',
            app,
            packageName: 'vare',
          }, (api) => {
            api.addInspector({
              id: 'test-inspector',
              label: 'Test inspector',
              icon: 'tab_unselected',
              treeFilterPlaceholder: 'Search for test...',
            })
            setInterval(() => {
              api.sendInspectorTree('test-inspector')
            }, 5000)

            api.on.getInspectorTree(payload => {
              if (payload.app === app && payload.inspectorId === 'test-inspector') {
                payload.rootNodes = [
                  {
                    id: 'root',
                    label: 'Root (4)',
                    children: [
                      {
                        id: 'child',
                        label: `Child ${payload.filter}`,
                        tags: [
                          {
                            label: 'active',
                            textColor: 0x000000,
                            backgroundColor: 0xFF984F,
                          },
                          {
                            label: 'test',
                            textColor: 0xffffff,
                            backgroundColor: 0x000000,
                          },
                        ],
                      },
                    ],
                  },
                ]
              }
            })

            api.on.getInspectorState(payload => {
              if (payload.app === app && payload.inspectorId === 'test-inspector') {
                if (payload.nodeId === 'root') {
                  payload.state = {
                    'root info': [
                      {
                        key: 'foo',
                        value: 'foo',
                        editable: true,
                      },
                      {
                        key: 'time',
                        value: 0,
                        editable: false,
                      },
                      {
                        key: 'bar',
                        value: {
                          _custom: {
                            display: '42!!!',
                            value: 42,
                            tooltip: 'The answer',
                          },
                        },
                        editable: false,
                      },
                      {
                        editable: false,
                        value: {
                          foo: {
                            _custom: {
                              value: 42,
                              tooltip: 'The answer',
                            },
                          },
                        },
                        key: 'omg',
                      },
                    ],
                  }
                } else {
                  payload.state = {
                    'child info': [
                      {
                        key: 'answer',
                        editable: false,
                        value: {
                          _custom: {
                            display: '42!!!',
                            value: 42,
                            tooltip: 'The answer',
                          },
                        },
                      },
                    ],
                  }
                }
              }
            })

            setInterval(() => {
              api.sendInspectorState('test-inspector')
            }, 5000)
          })
        },
      })
    },
  }
}

const vareDevTool = createVareDevTool()

export default boot(({app}) => {
  app.use(vareDevTool as any)
})