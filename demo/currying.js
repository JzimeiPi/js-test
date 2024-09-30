// 函数柯里化
function currying(func, ...args) {
	return function (...rest) {
		const allArgs = [...args, ...rest];
		if (allArgs.length >= func.length) {
			return func.apply(this, allArgs);
		} else {
			return currying(func, ...allArgs);
		}
	};
}

// 测试达到的结果
const sum = (a, b, c, d) => a + b + c + d;

console.log(currying(sum)(1)(2)(3)(4)); // 10
console.log(currying(sum, 1)(2)(3)(4)); // 10
console.log(currying(sum, 1, 2)(3)(4)); // 10
console.log(currying(sum, 1, 2)(3, 4)); // 10
console.log(currying(sum, 1, 2, 3, 4)()); // 10
