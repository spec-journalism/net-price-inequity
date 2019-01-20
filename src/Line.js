import React, { PureComponent } from 'react';
import injectSheet from 'react-jss';
import { select as d3Select } from 'd3-selection';
import 'd3-transition';
import { lineAnimTime, shortLineAnimTime, animDuration } from './constants';

import Point from './Point';
import LineLabel from './LineLabel';
import PercentGrowth from './PercentGrowth';

const styles = theme => ({
  line: {
    fill: 'none',
    strokeWidth: '2.5px',
    stroke: props => theme[props.theme],
  },
  hideLine: {
    animation: 'fadeOut',
    animationDuration: animDuration,
    opacity: 0,
  },
});

class Line extends PureComponent {
  state = {
    oldGenerator: this.props.generator,
    pathDefinition: this.props.generator(this.props.data),
    pathLength: null,

    isEndVisible: false,
    isStartVisible: true,
  };

  pathRef = React.createRef();

  componentDidMount() {
    const { current: node } = this.pathRef;
    const length = node.getTotalLength();
    d3Select(node)
      .attr('stroke-dasharray', length)
      .attr('stroke-dashoffset', length);
  }

  componentDidUpdate(prevProps, prevState) {
    const SCALE_TEST = 10;
    if (
      false &&
      prevProps.yScale(SCALE_TEST) === this.props.yScale(SCALE_TEST)
    ) {
      // Scale did not change, so we don't have to animate anything
      return;
    }

    const { isVisible, generator, data } = this.props;
    const { current: node } = this.pathRef;

    if (isVisible && !prevProps.isVisible) {
      // Line should be visible, and since the scale changed, we need to animate it in.
      const pathLength = node.getTotalLength();
      // Save these values for when we animate line out
      this.setState({
        pathLength,
        oldGenerator: generator,
        isStartVisible: true,
      });
      d3Select(node)
        .attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(lineAnimTime)
        .attr('stroke-dashoffset', 0)
        .on('end', () => this.setState({ isEndVisible: true }));
    } else if (!isVisible && prevProps.isVisible) {
      // Line should be hidden, and since the scale changed, we need to animate it out.
      const { pathLength, oldGenerator } = this.state;
      d3Select(node)
        .attr('d', oldGenerator(data))
        .transition()
        .duration(shortLineAnimTime)
        .attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .on('end', this.setState({ isStartVisible: false }));
      this.setState({ isEndVisible: false });
    }
  }

  render() {
    const { oldGenerator, isEndVisible, isStartVisible } = this.state;
    const {
      classes,
      generator,
      data,
      xScale,
      yScale,
      theme,
      incomeBracket,

      isPercentGrowthVisible = false,
      isVisible,
    } = this.props;

    const startPointX = xScale(2008);
    const startPointY = yScale(data[0]);
    const endPointX = xScale(2016);
    const endPointY = yScale(data[data.length - 1]);

    const labelX = xScale(2009);
    const labelY = yScale(data[1]) + (incomeBracket === 1 ? -84 : 62);
    return (
      <g>
        <Point
          x={startPointX}
          y={startPointY}
          theme={theme}
          isVisible={isStartVisible}
        />
        <g>
          <path
            ref={this.pathRef}
            d={isVisible ? generator(data) : oldGenerator(data)}
            className={classes.line}
          />
        </g>
        <Point
          x={endPointX}
          y={endPointY}
          theme={theme}
          isVisible={isEndVisible}
        />

        {/* TODO: incomeBracket and theme are equivalent and should be one variable */}
        <LineLabel
          x={labelX}
          y={labelY}
          incomeBracket={incomeBracket}
          theme={theme}
          isVisible={isEndVisible}
        />

        <PercentGrowth
          baseX={startPointX}
          baseY={startPointY}
          x={endPointX}
          y={endPointY}
          isVisible={isPercentGrowthVisible}
        />
      </g>
    );
  }
}

export default injectSheet(styles)(Line);
