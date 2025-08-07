<script setup lang="ts">
import { useNextHolidayApi } from '../composables/useNextHolidayApi'
import { useTodayInfoApi } from '../composables/useTodayInfoApi'
import { getTime, getWeekday, getYear, getMonth, getDay } from '../helpers/date'
import type { IContentBaseProps } from '../types'

const props = defineProps<IContentBaseProps>()
const { isDayOff } = useTodayInfoApi(props.date)
const { name, rest } = useNextHolidayApi(props.date)
</script>

<template>
  <section id="datetime">
    <p id="moment">{{ getTime(props.date) }}</p>
    <p>
      <span>
        今天是<span class="hightlight">{{ getYear(props.date) }}</span
        >年<span class="hightlight">{{ getMonth(props.date) }}</span
        >月<span class="hightlight">{{ getDay(props.date) }}</span
        >日<span class="hightlight">{{ getWeekday(props.date) }}</span>
      </span>
      <span v-if="isDayOff"> 今天是<span class="hightlight">休息日</span>，放松一下吧</span>
      <span v-else>
        距离下一个休息日<span class="hightlight">{{ name }}</span
        >还有<span class="hightlight">{{ rest }}</span
        >天
      </span>
    </p>
  </section>
  <hr />
</template>

<style scoped>
hr {
  border: none;
  border-top: 2px solid orange;
  margin: 0;
}

p {
  margin: 2px 0;
  font-size: 1rem;
  line-height: 1.3;
}

.hightlight {
  margin: 0 3px;
  font-size: 1.2rem;
  font-weight: bold;
}

#datetime {
  margin-bottom: 8px;
  padding: 0.5rem;
  text-align: center;
}

#moment {
  margin: 0 0 8px 0;
  font-size: 3rem;
  font-weight: bold;
  line-height: 1;
}
</style>
