# def calculate_speed(total_frames, desired_time):
#     # 每秒呼叫的次數
#     calls_per_second = 60

#     # 計算速度
#     speed = total_frames / (desired_time * 60)

#     return speed

# # 提供動畫的總幀數和希望的播放時間
# total_frames = 5
# desired_time = 0.5

# # 計算速度
# speed = calculate_speed(total_frames, desired_time)

# print("計算出的速度為:", speed)

def to_base26(number):
    if number == 0:
        return "0"
    result = ""
    while number > 0:
        number, remainder = divmod(number, 26)
        # 將餘數轉換為字母
        result = chr(ord('A') + remainder - 1) + result
    return result

number = 1045
result_base26 = to_base26(number)
print(result_base26)