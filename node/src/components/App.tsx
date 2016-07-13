import * as React from 'react'
import * as ReactDom from 'react-dom'

interface IAppProps {
}

interface IAppState {
}

export default class App extends React.Component<IAppProps, IAppState> {
  state: IAppState = {
  }

  constructor() {
    super()
  }

  render() {
    return (
      <div>
        <input type="text"/>
        I'm react.
      </div>
    )
  }
}
