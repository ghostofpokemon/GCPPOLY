import {Component} from 'react';

class API extends Component {
  constructor() {
    super();
    this.state = {data: [], cleannum: [], percent: []};
  }

  componentDidMount() {
    try {
      fetch('https://global-mind.org/gcpdot/gcpindex.php')
        .then((res) => res.text())
        .then((body) => this.setState({data: body}));
    } catch (e) {
      console.log(e);
    }

    setInterval(() => {
      fetch('https://global-mind.org/gcpdot/gcpindex.php')
        .then((res) => res.text())
        .then((body) => this.setState({data: body}));
    }, 5000);
  }

  render() {
    return <div>{this.state.data ? Num(this.state.data) : 'loading'}%</div>;
  }
}

export default API;

function Num(og) {
  var xx = JSON.stringify(og);
  var n = xx.search(/(\d+)/);
  var m = xx.search(/<\/s/);
  var x = xx.slice(n, m);
  var b2 = xx.slice(m);
  var k = b2.search(x);
  var b3 = b2.slice(k);
  var b = b3.search(/0\.\d+/);
  var b4 = b3.slice(b, b + 9);
  var pc0 = b4 * 100;
  var pc = String(pc0).substring(0, 5);
  //var rev = 100 - pc;

  return String(pc).substring(0, 5);
}
