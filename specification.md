# 德州扑克

## 规则简介

德州扑克是一个2 - 10人参与的多人扑克游戏，游戏共有4轮，玩家在每轮游戏中投注，投注金额将进入底池，最后一轮将会根据固定规则比较玩家手中牌的大小，如果在最后一轮结束之前仅剩一轮玩家，则该玩家为胜者，赢得底池中所有金额；如果平局则这些玩家将平分底池内将近；但如果玩家在任意一轮弃牌，则退出游戏，该玩家不会参与后续的游戏，并且之前所投注金额全部将会从筹码中扣除。

## 操作简介

### 弃牌：玩家选择弃牌，则退出游戏，该玩家当前手中筹码不变，该局游戏内投入的筹码输光，底池金额不变

| 等待玩家 | 操作中玩家 | 可选操作         | 已操作玩家 | 投注金额 | 底池金额 | 已退出玩家 |
| -------- | ---------- | ---------------- | ---------- | -------- | -------- | ---------- |
| B、C、D  | A          | 加注、跟注、弃牌 |            | 10       | 30       |            |
| C、D     | B          | 加注、跟注、弃牌 | A          |          | 40       |            |
|          | 弃牌       |                  |            |          |          |            |
| D        | C          | 加注、跟注、弃牌 | A          |          | 40       | B          |

### 跟注：玩家选择跟注，跟注金额 *price* 与上一位选择下注或加注的玩家投注金额一致，该玩家当前手中筹码减少 *price*，同时底池金额增加 *price*

| 等待玩家 | 操作中玩家 | 可选操作         | 已操作玩家 | 投注金额 | 底池金额 | 已退出玩家 |
| -------- | ---------- | ---------------- | ---------- | -------- | -------- | ---------- |
| B、C、D  | A          | 加注、跟注、弃牌 |            | 10       | 30       |            |
| C、D     | B          | 加注、跟注、弃牌 | A          | 10       | 40       |            |
|          | 跟注       |                  |            |          |          |            |
| D        | C          | 加注、跟注、弃牌 | A、B       |          | 50       |            |

### 加注：当前投注金额为 *price*，玩家选择加注，加注金额与大盲注的投注金额 *delta* 一致，该玩家的投注金额为 *price + delta*，并且手中筹码减少 *price + delta*，底池金额增加 *price + delta*

| 等待玩家 | 操作中玩家 | 可选操作         | 已操作玩家 | 投注金额 | 底池金额 | 已退出玩家 |
| -------- | ---------- | ---------------- | ---------- | -------- | -------- | ---------- |
| B、C、D  | A          | 加注、跟注、弃牌 |            | 10       | 30       |            |
| C、D     | B          | 加注、跟注、弃牌 | A          | 15       | 40       |            |
|          | 加注       |                  |            |          |          |            |
| D        | C          | 加注、跟注、弃牌 | A、B       |          | 55       |            |

### 过牌：在第2~4轮玩家选择过牌，当前玩家手中筹码不变，底池金额不变，轮到下一名玩家行动

| 等待玩家 | 操作中玩家 | 可选操作               | 已操作玩家 | 投注金额 | 底池金额 | 已退出玩家 |
| -------- | ---------- | ---------------------- | ---------- | -------- | -------- | ---------- |
| B、C、D  | A          | 加注、跟注、过牌、弃牌 |            |          | 30       |            |
| C、D     | B          | 加注、跟注、过牌、弃牌 | A          |          | 30       |            |
|          | 过牌       |                        |            |          |          |            |
| D、B     | C          | 下注、过牌、弃牌       | A、B       |          | 30       |            |

### All in：当玩家手中筹码小于跟注金额时，玩家选择 all in，玩家手中筹码为0，底池增加金额为该玩家 all in 金额，该玩家等待结算

| 等待玩家 | 操作中玩家 | 可选操作                 | 已操作玩家 | 投注金额 | 底池金额 | 已退出玩家 |
| -------- | ---------- | ------------------------ | ---------- | -------- | -------- | ---------- |
| B、C、D  | A          | 加注、跟注、过牌、弃牌   |            | 10       | 30       |            |
| C、D     | B          | 加注、跟注、弃牌、All in | A          | 5        | 40       |            |
|          | All in     |                          |            |          |          |            |
| D        | C          | 加注、跟注、弃牌         | A、B       |          | 45       |            |

## 奖金分配简介

### 当游戏进行到最后一轮结束，摊牌后，牌组合最大的玩家获得底池内所有奖金

| 赢家 | All in 玩家 | 底池金额 | 边池金额 | 赢得金额 |
| ---- | ----------- | -------- | -------- | -------- |
| A    |             | 30       |          | 30       |

### 当游戏进行到最后一轮结束，摊牌后，若牌组合最大的有多名玩家，则这些玩家平分底池内奖金

| 赢家 | All in 玩家 | 底池金额 | 边池金额 | 赢得金额        |
| ---- | ----------- | -------- | -------- | --------------- |
| A/B  |             | 30       |          | A（15）/B（15） |

### 当游戏进行到最后一轮结束，摊牌后，若 All in 玩家赢得比赛，则该玩家只能赢得 All in 时边池内的金额，剩余玩家中的胜者赢得底池内所有奖金

| 赢家 | All in 玩家 | 底池金额 | 边池金额 | 赢得金额        |
| ---- | ----------- | -------- | -------- | --------------- |
| A/B  | B           | 30       | 20       | A（10）/B（20） |

