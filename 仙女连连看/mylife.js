new Vue({
    el:'#app',
    data:{
        gameList:[],    //游戏小卡片总数组
        isToGame:true,  //开始界面是否显示

        initial_seconds:160,    //默认游戏倒计时    
        seconds:'',     //当前游戏倒计时
        countdown_timer:null,   //倒计时定时器

        starts:'暂停游戏',  //游戏状态
        suspended:true,     //小卡片是否能点击翻开
        isGameOver:false,   //游戏结束界面是否显示

        cardList:[],    //选定的2个小卡片的数组
        card_index:[],  //选定的2个小卡片的index
        judge_timer:null,   //判断回合定时器

        theycount:0,    //步数
        score:0,    //得分

        GameOverResult:'',  //游戏结果：成功/失败
        ranking:[       //游戏结束排行榜数组
            {
                ctheycount:54,
                cseconde:130,
                times:'2020-08-21 16:24:30'
            },
            {
                ctheycount:64,
                cseconde:142,
                times:'2020-08-21 16:25:30'
            },
        ],

        isBgshow:false,     //背景选项界面是否显示
        bg_index:2,        //当前背景序号
        bg_imglist:[],      //背景图像数组
        toggleBg_btn:false,     //是否自动切换背景
        toggleBg_timer:null,    //自动切换背景定时器
    },

    methods:{
        Star_load(){//游戏开始前加载随机卡片图像

            this.seconds=this.initial_seconds
            let arr=[]
            for(let i=0;i<6;i++){
                for(let i=0;i<9;i++){
                    arr.push(i)     //创建只有由数字0~8组成的数组，每个数字出现6次
                }
            }
            let result=[]
            for(let i=0;i<54;i++){
                let x= ~~(Math.random()*arr.length)     //按位取反两次，即保留整数
                result.push(arr[x]) //把arr中的数打乱插入result中
                arr.splice(x,1)     //每次插入一个数就要删除原数组的那个数
            }
            this.gameList.forEach((e,i) => {
                e.randomImg= `./img/YASI${(result[i]%23)+1}.jpg`   //以result中数字给予每个小卡片一张随机图
                e.img_index=result[i]           //给予小卡片图像索引，方便对比图片是否相同
            });
        },
        Star_game(){//开始游戏按钮
            this.countdown()    //开启游戏倒计时
            this.isToGame=false //隐藏开始界面
        },
        countdown(){//游戏倒计时
            this.countdown_timer=setInterval(()=>{
                if(this.seconds>0){
                    --this.seconds  //减少秒数
                }
                else if(this.seconds<1){
                    this.GaveOver()     //时间结束调用游戏结束函数
                }
            },1000)
        },
        StopGame(){//暂停游戏按钮

            if(!this.isGameOver){   //如果游戏结束界面显示就不执行下面的
                if(this.starts=='暂停游戏'){
                    this.starts='继续游戏'
                    clearInterval(this.countdown_timer)     //暂停游戏倒计时
                    this.suspended=false    //暂停游戏无法点击翻开卡片
                }
                else if(this.starts=='继续游戏'){
                    this.starts='暂停游戏'
                    this.countdown()    //继续游戏倒计时
                    this.suspended=true
                }
            }
        },
        SelectCard(item,index){//点开一个小卡片

            //如果点击的小卡片已经完成配对，或者游戏暂停，或者cardList数组长度为2时，点击无效
            if(item.complete|| !this.suspended||this.cardList.length==2){
                return false;
            }
            else{
                if(index!=this.card_index[0]){  //如果当前点击的卡片索引不等于上一次电极的卡片
                    this.card_index.push(index) //就把当前卡片索引放入cardList
                    this.cardList.push(item.img_index)
                }
                this.gameList[index].Sel_img=true   //让点击的小卡片添加翻开的css样式
            }
            this.judge()
        },
        judge(){//判断选定的2个小卡片是否相同

            if(this.cardList.length==2){
                if(this.cardList[0]===this.cardList[1]){    //判断2个被选中的卡片的图片索引是否一致
                    this.theycount++    //步数+1
                    this.score+=2   //得分加2
                    this.judge_timer=setTimeout(()=>{
                        this.card_index.forEach(e=>{
                            this.gameList[e].complete=true  //图片相同就让这两张的complete为true
                        })
                        this.Clear_card()   //判定完成后，定时器0.5s，复原界面翻开效果
                    },500)
                    if(this.score>=54){     //得分到54，则游戏结束
                        this.GaveOver()
                    }
                }
                else{
                    this.theycount++    //步数+1
                    this.judge_timer=setTimeout(()=>{
                        this.Clear_card()
                    },500)      //判断完成后，定时器0.5s，复原界面翻开效果
                }
            }
        },
        Clear_card(){//每回合结束，初始化卡片状态
            this.gameList.forEach((e,i)=>{
                e.Sel_img=false     //移除所有卡片翻开效果
            })
            this.cardList=[]    //清空数组
            this.card_index=[]  //清空数组
        },
        GaveOver(){//游戏结束

            clearInterval(this.countdown_timer)
            clearInterval(this.judge_timer)
            this.gameList.forEach((e,i)=>{
                e.Sel_img=true
            })
            if(this.score>=54){
                this.GameOverResult='恭喜通关！'
                this.isGameOver=true    //显示游戏结束界面
                this.end()              //游戏通关，结算成绩排行
            }
            else{
                this.GameOverResult='挑战失败~'
                this.isGameOver=true
            }
        },
        end(){//结算 返回使用步数、时间，通关时间
            let Ends= {}     //创建对象
            Ends.ctheycount=this.theycount      //使用步数
            Ends.cseconde=this.initial_seconds-this.seconds     //使用时间
            let dates=new Date()
            function Dat(n){
                if(n<10){
                    return n='0'+n
                }
                else{
                    return n
                }
            }
            let compare=function(x,y){
                //已使用步数为基准排名
                if(x.ctheycount<y.ctheycount){
                    return -1
                }
                else if(x.ctheycount>y.ctheycount){
                    return 1
                }
                else{
                    return 0
                }
            }
            //当前通关时间日期
            Ends.times=`${dates.getFullYear()}-${Dat(dates.getMonth())}-${Dat(dates.getDate())} 
            ${Dat(dates.getHours())}:${Dat(dates.getMinutes())}:${Dat(dates.getSeconds())}`
            this.ranking.push(Ends)
            this.ranking.sort(compare)  //已使用步数为基准排名
        },
        Restart(){//重新开始游戏 初始化所有内容
            this.Star_load()    //重新加载区块随机小图像
            clearInterval(this.countdown_timer)
            this.starts='暂停游戏'
            this.initial_seconds=160
            this.seconds=this.initial_seconds
            this.suspended=true
            this.theycount=0
            this.score=0
            this.isGameOver=false
            this.Clear_card()
            this.countdown()
            this.gameList.forEach((e,i)=>{
                e.complete=false
            })
        },
        ShowBg(){//显示背景选项界面
            this.isBgshow=!this.isBgshow
        },
        ToggleBg(index){//手动切换背景图像
            this.bg_index=index
        },
        automatic(){//自动切换背景图像
            this.toggleBg_btn=!this.toggleBg_btn
            if(this.toggleBg_btn){
                this.toggleBg_timer=setInterval(()=>{
                    this.bg_index++
                    if(this.bg_index>this.bg_imglist.length-1){
                        this.bg_index=0
                    }
                },6000)
            }
            else{
                clearInterval(this.toggleBg_timer)
            }
        },
    },
    computed:{
        ReturnBg(){//返回背景图像地址
            return `background-image:url(${this.bg_imglist[this.bg_index]})`
        },
    },
    mounted(){

        for(let i=0;i<54;i++){
            let c={}            //创建54个小卡片对象
            c.randomImg=''      //随机给予的一张图片
            c.img_index=''      //图片索引
            c.complete=false    //是否完成配对
            c.Sel_img=''        //是否被翻开
            this.gameList.push(c)   
        }
        this.Star_load()    //初始化加载函数

        for(let i=1;i<11;i++){
            this.bg_imglist.push(`./img/background${i}.jpg`)
        }

    },
})