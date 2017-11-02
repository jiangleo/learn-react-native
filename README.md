# 写一个轮播图，学会 React Native

我学习 Web 的第一课，就是学习写一个轮播图，在写轮播图时自然地将 html、css、js、DOM、组件设计等各方面简单的知识点给串起来了。学习 React Native 的时候，也自然用起了这个思路，希望帮助到那些对 React Native 有兴趣的同学。

本文会一步一步和带领大家实现一个轮播图组件，帮助大家将一个个单独的知识点给串。学习本文之前，最好对 React Native 有所了解。其中的一些单独的知识点，如果不是很了解，可以在学习过程中点击相关链接学习。这个单独的知识点包括：

- Components: View、Touchble*
- APIs: Animated、PanResponder、StyleSheet

轮播图的最终效果图如下：

![](https://segmentfault.com/img/bVXNIB?w=480&h=324)

## 简单轮播图组件

### 接口设计

一步实现最终效果图实现的效果是很难的，所以不如先把轮播图设计的简单点，然后一步一步地优化。
这个简单的轮播图组件，只拥有如下 3 个功能：

- 在展现区域默认显示第 index 个项目的内容；
- 右滑，在展现区域显示上一个项目的内容；
- 左滑，在展现区域显示下一个项目的内容。

轮播图的主要思想是，每次只显示一个个项目面，超出容器个项目面被隐藏，思路图如下：

![](https://pic4.zhimg.com/50/v2-3486914b69a958eec8f30192452defab_720x4096.jpg)
[图片来源](https://zhuanlan.zhihu.com/p/29034015)

为了达到复用的效果，还需要将组件调用方和组件本身分离。即组件本身只有一个，但是可以被多次调用。

在明确简单轮播图组件的设计要求后，就很自然地设计出其调用方式：

- `style`: 设置外部容器的样式。
- `index`: 控制组件展示第 `index` 项目。
- `onChange`: 当用户点击上一个按钮、点击下一个按钮触发，并通过回调参数通知调用方，`index` 应该怎么改变。
- `children`: 所有轮播项目。


```java
state={
    index: 0,
}

render() {
    return (
        <Swiper
        	style={{with: 100}}
            index={this.state.index}
            onChange={(index)=> {
                this.setState({
                    index: index
                })
            }}
        >
            <View />
            <View />
            <View />
        </Swiper>
    );
}
```


### 组件实现

实现轮播的核心原理是，当 `index` 变化时，改变 Swiper 所有轮播项目的 `translateX` 值。超出 Swiper 容器的轮播项目会被隐藏，所以只会展现当前的第 `index` 个项目。其中有一个等式：

    轮播项目位移距离 = - 当前展示的项 * 外部容器宽度
    translateX =  - index *  layoutWidth

在渲染之前，外部容器宽度 `layoutWidth` 是不知道的。因此只能在外部容器渲染后，通过 `onLayout` 函数，来获取外部容器宽度。在获取宽度后，再将正在的轮播项目渲染出来。但是这样做，需要两次渲染才能将轮播图显示出来。在一些对性能要求高的项目中，可以通过暴露一个外部容器初始化宽度 `initialWidth` 的接口来提前获取，避免两次渲染。

- 新接口 `initialWidth`: 外部容器初始化宽度

另外，我写代码的时候，有个小技巧，边写边测，通过小步迭代的方式，进行快速进行开发。因此，左滑、右滑切换的功能，不妨先用上一个、下一个按钮来代替。

其核心代码，如下：

```java
_handleLayout = ({nativeEvent}) => {
    this.setState({
        layoutWidth: nativeEvent.layout.width,
    })
}


render() {
    const {children, style, index} = this.props;
    const translateX =  - index * this.state.layoutWidth;
    const items = children.map((item, index) => React.cloneElement(
            item,
            {
                key: index,
                style: [
                    ...item.props.style,
                    {
                        width: this.state.layoutWidth,
                        transform: [{translateX,}],
                    }
                ]
            },
    ))

    return (
        <View
            style={[styles.container,style]}
            onLayout={this._handleLayout}
        >
            {items}
        </View>
    )
}
```

[完整代码](https://github.com/jiangleo/learn-react-native/blob/master/App/0_SimpleSwiper/SimpleSwiper.js)

## 添加动画

### `Animated` 声明式动画

动画功能会用到 `Animated` 这个 API。

`Animated` 和 `state` 一样，都符合符合声明式编程的原理。由于 `Animated` 的动画值也可以看做页面的某种状态。在官网的示例代码中，直接将`Animated` 的动画值直接挂在了 `this.state` 上，也证明了这一点。
下面我们将 `Animated` 和 `state` 进行对比，帮助大家进行理解：

 # | Animated | state
声明 | `this.animKey = animValue}` | `this.state={stateKey: stateValue}`
--| --| --
赋值 | `<Animated.View props={this.animKey}>` | `<View props={this.state.stateKey}>`
改变状态 | this.animKey.setValue(newAnimValue)  | `this.setState({stateKey: newStateValue})`
改变状态_动画曲线形式 |   `Animated.spring(this.animKey, {toValue: newAnimValue}).toStart()`  | 无

### 功能描述和接口实现

在完成轮播图组件的基础切换功能的基础上，要给它添加动画功能：

- 点击上一个按钮，从当前显示项目逐渐右移至上一个项目；
- 点击下一个按钮，从当前显示项目逐渐左移至下一个项目。

一开始我们使用 `index` 这个属性来控制要展现的项目。因为动画会有中间值，比如介于 0 和 1 之间的值，所以我们需要一个新的值来表示项目的位置。

- positionAnimated：控制项目的位移位置

为了组件接口的设计方便，不应该把这个底层状态 `positionAnimated` 暴露给组件调用方去处理。组件调用方依旧只需要控制 `index` 即可动画改变当前展示的项目。而在组件内部，监听 `index` 的更新，然后驱动 `positionAnimated` 的改变项目位置即可。

动画版轮播图的核心原理和最初的简单版类似：

    translateX =  - index *  layoutWidth

核心代码如下：


```java
scrollTo = ( toIndex ) => {
    Animated.spring(this.state.positionAnimated, {
        toValue: - toIndex * this.state.layoutWidth,
        friction: 12,
        tension: 50,
    }).start()
}

render() {
    // ...
    const items = children.map((item, index) => (
        <Animated.View
            style={{
                width: layoutWidth,
                transform: [{
                    translateX: this.state.positionAnimated
                }],
            }}
            key={index}
        >
            {item}
        </Animated.View>
    ));
    // ...
}
```

[完整代码](https://github.com/jiangleo/learn-react-native/blob/master/App/1_AnimatedSwiper/AnimatedSwiper.js)


## 支持手势控制


### 手势事件简介

React Native 的手势事件类似于 Web，但 React Native 的手势事件更加强大和灵活。

两者相似点有：

 # | React Native | Web
--|--|--
开始触碰 | onPanResponderGrant | touchstart
开始移动 | onResponderMove | touchmove
结束触碰 | onResponderRelease  | touchend
意外取消 |   onResponderTerminate  | touchcancel


两者不同点在于，React Native 可以针对具体元素绑定手势，而在 Web 中只能针对全局 `document` 进行手势监听。

在 React Native 手势接口设计上，大家可以先思考一个问题。因为 React Native 允许两个元素同时监听手势事件，如果两个元素都监听了手势，那么 React Native 应该响应那个元素呢？在 React Native 中设计了，成为响应者 `Responder` 的概念。大概可以描述为：如果没有响应者，任何元素都可以成为响应者；如果有元素是响应者，必须当前响应元素同意不再继续成为响应者后，其他元素才能变成响应者。总而言之，React Native 通过元素间的谈判，保障了手势响应者只有一个。谈判接口主要有：

 # | React Native | Web
--|--|--
开始触碰，是否成为响应者 | onStartShouldSetPanResponder => boolean | 无
开始移动，是否成为响应者 | onMoveShouldSetPanResponder => boolean | 无
有其他响应者，是否释放响应权 | onPanResponderTerminationRequest => boolean | 无

以上手势事件非常底层，写起来也很复杂。而一起简单的手势事件，如 click 事件，并不需要这么复杂。为此 React Native 基于以上手势事件，提供了 `TouchableHighlight` 等组件。该组件封装了一些常用的点击事件和点击相关的配置，如： `onPress`(click)、`underlayColor` 点击态背景色等。

在写简单轮播图时，用的是点击事件来代替滑动事件。点击事件的处理，用到的就是 `TouchableHighlight` 组件。


### 实现

手势轮播图在动画轮播图上进行了升级，它需要支持以下功能：

- 滑动：用户滑动时，轮播图跟着手指移动；
- 右滑：用户向右滑动超过某个阙值后，触发右滑动作，轮播图位移至上一个项目；
- 左滑：用户向左滑动超过某个阙值后，触发左滑动作，轮播图位移至下一个项目。

当用户滑动时，需要相应的改变 `positionAnimated` 的值，使轮播图跟着手指移动。这里有个等式：

    最终的位置 = 开始的位置 + 手势移动过的距离
    position = startPosition + movePosition

开始的位置，需要在轮播图响应手势时 `onPanResponderGrant` 记录。手势移动过的距离可以在手势移动时 `onResponderMove` 获取，与此同时通过 `positionAnimated.setValue(position)` 改变轮播图的位置，让轮播图跟着手指移动。

左滑、右滑，是在用户抬起手指时 `onResponderRelease` 开始触发，触发的临界点我们可以简单的设置为外部容器一半的宽度。然后通过 `onChange` 事件告诉，调用方要改变的位置是什么，由调用方位移轮播图。


实现的核心代码如下：


```java
onPanResponderEnd = () => {
    // 超过 50% 的距离，触发左滑、右滑
    const index = Math.round(-this.position / this.state.layoutWidth)
    const safeIndex = this.getSafeIndex(index);
    this.props.onChange(safeIndex)
};

responder = PanResponder.create({
    onPanResponderGrant: (evt, gestureState) => {
        // 用户手指触碰屏幕，停止动画
        this.state.positionAnimated.stopAnimation();
        // 记录手势响应时的位置
        this.startPosition = this.position;
    },
    onPanResponderMove: (evt, { dx }) => {
        // 要变化的位置 = 手势响应时的位置 + 移动的距离
        const position = this.startPosition + dx
        this.state.positionAnimated.setValue(position)
    },
    onPanResponderRelease: this.onPanResponderEnd,
    onPanResponderTerminate: this.onPanResponderEnd,
});
```

[完整代码](https://github.com/jiangleo/learn-react-native/blob/master/App/2_GestureSwiper/GestureSwiper.js)

## 总结

到此一个 React Native 轮播图的也已经实现了，相信大家也应该对 React Native 有了大概的了解和认知。

在写这个轮播图的过程中，应用了 `View`、`Touchble*` 组件和 `Animated`、`PanResponder`、`StyleSheet` API。

在写轮播图的过程中，还应用了小步迭代的开发方式。即实现的过程中，将这个轮播图分为了三个阶段进行开发：简单轮播图、动画轮播图、手势轮播图。每个阶段，又可以分为三个步骤：准备要应用的知识(google)、实现功能描述、实现。通过小步迭代的方式，可以将一个大问题分解为几个小问题，再把小问题分解为最基本的知识点，再去设法实现。

最后，这还只是一个轮播图的雏形，还有很多优化点可以做，比如：

- isLoop： 是否头尾衔接的循环轮播
- horizontal：是否水平轮播
- renderPager：接受一个组件，该用于处理手势和动画。比如可以使用 Swiper 和 ViewPagerAnder，在一些特定场景下处理手势和动画，达到更高的性能。
- showsPagination：实现展现轮播提示的视图，比如小圆点提示当前播到第几个轮播项目了。

大家可以参考代码中的 SwiperAndroid 进行完成。

最后附上地址： https://github.com/jiangleo/learn-react-native


