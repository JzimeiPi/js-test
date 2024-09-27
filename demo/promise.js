/**
 * promise 构造函数
 * 符合 promise A+ 规范
 */

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
	#state = PENDING;
	#result = undefined;
	#handlers = [];

	constructor(executor) {
		const resolve = (data) => {
			this.#changeState(FULFILLED, data);
		};
		const reject = (reason) => {
			this.#changeState(REJECTED, reason);
		};

		try {
			executor(resolve, reject);
		} catch (err) {
			reject(err);
		}
	}

  #isPromiseLike(value) {
    return (
      value !== null &&
      (typeof value === "object" || typeof value === "function") &&
      typeof value.then === "function"
    );
  }

  #runMicroTark(func) {
    if (
      process &&
      typeof process === "object" &&
      typeof process.nextTick === "function"
    ) {
      process.nextTick(func);
    } else if (typeof MutationObserver === "function") {
      const ob = new MutationObserver(func);
      const textNode = document.createTextNode("1");
      ob.observe(textNode, {
        characterData: true,
      });
      textNode.data = "2";
    } else {
      setTimeout(func, 0);
    }
  }

	#changeState(state, result) {
		if (this.#state !== PENDING) return;
		this.#state = state;
		this.#result = result;

		this.#run();
	}

  #runOnce(callback, resolve, reject) {
    this.#runMicroTark(() => {
      if (typeof callback === "function") {
        try {
          const value = callback(this.#result);
          if (this.#isPromiseLike(value)) {
            value.then(resolve, reject);
          } else {
            resolve(value);
          }
        } catch (err) {
          reject(err);
        }
      } else {
        // 状态透明（穿透）
        const settled = this.#state === FULFILLED ? resolve : reject;
        settled(this.#result);
      }
    });
	}

	#run() {
		if (this.#state === PENDING) return;

		while (this.#handlers.length) {
			const { onFulfilled, onRejected, resolve, reject } =
				this.#handlers.shift();

			if (this.#state === FULFILLED) {
				this.#runOnce(onFulfilled, resolve, reject);
			} else if (this.#state === REJECTED) {
				this.#runOnce(onRejected, resolve, reject);
			}
		}
	}

	then(onFulfilled, onRejected) {
		return new MyPromise((resolve, reject) => {
			this.#handlers.push({
				onFulfilled,
				onRejected,
				resolve,
				reject,
			});
			this.#run();
		});
	}

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(onFinally) {
    return this.then(
      (res) => {
        onFinally()
        return res
      }, 
      (err) => {
        onFinally()
        throw err
      })
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;

    let _resolve, _reject
    const p = new MyPromise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })
    if (p.#isPromiseLike(value)) {
      value.then(_resolve, _reject)
    } else {
      _resolve(value)
    }
    return p
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason))
  }
}

/**
 *  测试代码
 */
/** reject */
const p = new MyPromise((resolve, reject) => resolve(1))
MyPromise.reject(p).catch(err => console.log(err))

/** resolve */
// const p = new MyPromise(resolve => resolve(1))
// console.log(MyPromise.resolve(p) === p);
// MyPromise.resolve(123).then(res => console.log(res))

/** catch finally */
// new MyPromise((resolve, reject) => {
//   reject(1);
//   // TODO: 异步错误无法捕获（会直接报错）
//   // setTimeout(() => {
//   // 	throw 123;
//   // }, 0);
// })
//   .then(
//     (res) => {
//       console.log("then resolve:", res);
//       return res
//     },
//     // (err) => {
//     //   console.log("then reject:", err);
//     // }
//   )
//   .then(
//     (res) => {
//       console.log('then2 resolve', res);
//     },
//     // (err) => {
//     //   console.log('then2 reject', err);
//     // }
//   )
//   .catch((err) => {
//     console.log("catch:", err);
//     return 'catch err'
//   })
//   .then(  
//     res => {
//       console.log('then3 res', res);
//     },
//     err => {
//       console.log('then3 err', err);
//     }
//   )
//   .finally(()=> {
//     console.log('finally');
//   })

/** 微队列 */
// new MyPromise((resolve) => {
// 	resolve(2);
// }).then((res) => {
// 	setTimeout(() => {
// 		console.log(res);
// 	}, 1000);
// });
// setTimeout(() => {
// 	console.log("setTime");
// }, 1000);
// console.log(1);
/** end */

/** async await */
// function delay(duration = 1000) {
// 	return new MyPromise((resolve) => {
// 		setTimeout(resolve, duration);
// 	});
// }

// async function test() {
// 	await delay();
// 	console.log("async");
// }
// test();

/** 基础测试 */
// const p = new MyPromise((resolve, reject) => {
// 	setTimeout(() => {
// 		resolve(2);
// 	}, 1000);
// });
// p.then((res) => {
// 	console.log(res);
// // then 返回 promise
// 	return new MyPromise((resolve) => {
// 		setTimeout(() => {
// 			resolve("promise:", res + 1);
// 		}, 1000);
// 	});
// }, null).then((data) => {
// 	console.log("ok:", data);
// });

// p.then(
// 	(res) => {
// 		console.log("resolve:", res);
// 	},
// 	(err) => {
// 		console.log("reject:", err);
// 	}
// );
