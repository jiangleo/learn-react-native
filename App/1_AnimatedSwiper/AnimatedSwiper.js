import React, { PureComponent } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    ViewPropTypes,
    TouchableHighlight,
    Animated,
} from 'react-native';

import PropTypes from 'prop-types';


const Button = ({text,style, onPress}) => {
    return (
        <TouchableHighlight style={style} onPress={onPress}>
            <Text>{text}</Text>
        </TouchableHighlight>
    )
}

export default class SimpleSwiper extends PureComponent {


    static propTypes = {
        /**
         *  设置外部容器的样式。
         */
        style: ViewPropTypes.style,
        /**
         *  设置外部容器的默认宽度。
         */
        initialWidth: PropTypes.number,
        /**
         * 轮播的视图
         */
        index: PropTypes.number,
        /**
         * 当前展现项目要变化时，触发该回调。回调参数为变化后的位置。
         */
        onChange: PropTypes.func,
        /**
         * 轮播项目
         */
        children: PropTypes.node.isRequired,
    };

    static defaultProps = {
        initialWidth: 0,
    };

    constructor(props) {
        super(props);

        this.state = {
            layoutWidth: props.initialWidth,
            positionAnimated: new Animated.Value(props.index)
        };
    }

    componentDidMount() {
    }

    componentDidUpdate(){
        this.scrollTo(this.props.index)
    }

    scrollTo = ( toIndex ) => {
        Animated.spring(this.state.positionAnimated, {
            toValue: toIndex,
            friction: 12,
            tension: 50,
        }).start()
    }

    getSafeIndex = (index) => {
        const max = this.props.children.length - 1;
        const min = 0;

        return Math.min(max, Math.max(index, min))
    }

    handlePress = (index) => () => {
        const safeIndex = this.getSafeIndex(index);
        this.props.onChange(safeIndex)
    }

    handleLayout = ({nativeEvent}) => {

        this.setState({
            layoutWidth: nativeEvent.layout.width,
        })
    }


    render() {
        const {children, style, index} = this.props;
        const {layoutWidth} = this.state;

        const items = children.map((item, index) => (
            <Animated.View
                style={{
                    width: layoutWidth,
                    transform: [{
                        translateX: Animated.multiply(this.state.positionAnimated, -layoutWidth),
                    }],
                }}
                key={index}
            >
                {item}
            </Animated.View>
        ));

        return (
            <View
                style={[styles.container, style]}
                onLayout={this.handleLayout}
            >
                {items}
                {/*两个测试用的按钮*/}
                <Button style={[styles.button,{left: 0}]} text={'上一个'} onPress={this.handlePress(index - 1)} />
                <Button style={[styles.button,{left: 50}]} text={'下一个'} onPress={this.handlePress(index + 1)} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        overflow:'hidden',
        flexDirection: 'row',
    },
    button: {
        position: 'absolute',
        top: 120,
        width: 50,
        height: 20,
        borderWidth: 1,
        borderColor: '#ccc',
    }
})