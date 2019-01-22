import React, { PureComponent } from 'react';
import injectSheet from 'react-jss';

import BackedText from './BackedText';
import theme from './theme';
import {
  incomeBrackets,
  animDuration,
  animTime,
  textBgPadding,
} from './constants';

const styles = theme => ({
  visible: {
    animation: 'fadeIn', // TODO: CENTRALIZE THESE ANIMATIONS
    animationDuration: animDuration,
  },
  hidden: {
    animation: 'fadeOut',
    animationDuration: animDuration,
    opacity: 0,
  },
  text: {
    fill: props => theme[props.theme],
    textAnchor: 'middle',
    fontSize: '1rem',
    stroke: 0,
    fontWeight: 300,
  },
  income: {
    fontWeight: 500,
    fill: '#fff',
    stroke: 0,
  },
});

class ShortLineLabel extends PureComponent {
  state = {
    rectBBox: {},
    isTransitioning: false,
    oldY: null,
  };

  incomeRef = React.createRef();

  recomputeRect = (oldY, oldRectY) => {
    const node = this.incomeRef.current;
    if (!node) {
      return;
    }

    const rectBBox = node.getBBox();
    rectBBox.width = node.getComputedTextLength();
    this.setState({ rectBBox, isTransitioning: true, oldY, oldRectY });
    setTimeout(() => this.setState({ isTransitioning: false }), animTime);
  };

  componentDidMount() {
    this.recomputeRect();
  }

  componentDidUpdate(prevProps, prevState) {
    const { y: oldY } = prevProps;
    if (this.props.y !== oldY) {
      this.recomputeRect(oldY, prevState.rectBBox && prevState.rectBBox.y);
    }
  }

  render() {
    const { rectBBox, isTransitioning, oldY, oldRectY } = this.state;
    const { x: rectX, width, height } = rectBBox;
    const {
      classes,
      x,
      incomeBracket,
      theme: lineTheme,
      isVisible,
    } = this.props;

    let { y: rectY } = rectBBox;
    let { y } = this.props;

    if (isTransitioning && oldY && oldRectY) {
      y = oldY;
      rectY = oldRectY;
    }

    return (
      <g
        className={
          isVisible ? isTransitioning ? (
            classes.hidden
          ) : (
            classes.visible
          ) : (
            classes.hidden
          )
        }
      >
        {rectX && (
          <rect
            x={rectX - textBgPadding}
            y={rectY - textBgPadding}
            width={width + textBgPadding * 2}
            height={height + textBgPadding * 2}
            fill={theme[lineTheme]}
          />
        )}
        <text x={x} y={y} className={classes.text}>
          <tspan className={classes.income} ref={this.incomeRef}>
            {incomeBrackets[incomeBracket]}
          </tspan>
        </text>
      </g>
    );
  }
}
export default injectSheet(styles)(ShortLineLabel);
