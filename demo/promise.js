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

	#changeState(state, result) {
		if (this.#state !== PENDING) return;
		this.#state = state;
		this.#result = result;

		this.#run();
	}

	#runOnce(callBack, resolve, reject) {
		if (typeof callBack === "function") {
			try {
				const data = callBack(this.#result);
				resolve(data);
			} catch (err) {
				reject(err);
			}
		} else {
			// 状态透明（穿透）
			const settled = this.#state === FULFILLED ? resolve : reject;
			settled(this.#result);
		}
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
}

const p = new MyPromise((resolve, reject) => {
	resolve(2);
});
p.then((res) => {
	console.log(res);
}, null);

p.then(
	(res) => {
		console.log("resolve:", res);
	},
	(err) => {
		console.log("reject:", err);
	}
);
