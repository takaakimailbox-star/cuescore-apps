import json,collections,re
CAT={'ja':{'p2':'対戦相手を選ぶと試合を開始できます','p1':'先攻プレーヤーを選ぶと試合を開始できます','both':'プレーヤーを選ぶと試合を開始できます'},
'en':{'p2':'Select an opponent to start the match','p1':'Select the first player to start the match','both':'Select players to start the match'},
'zh-Hans':{'p2':'选择对手后即可开始比赛','p1':'选择先手球员后即可开始比赛','both':'选择球员后即可开始比赛'}}
base='outputs/gate-b-p1p2-audit/'
stat=collections.defaultdict(lambda:collections.Counter());issues=collections.defaultdict(list)
for L in ['ja','en','zh-Hans']:
    rows=json.load(open(base+f'audit-{L}.json'))['rows']
    for r in rows:
        st=r['state'];k=(st,r['kind']);s=stat[k];s['n']+=1
        nt=r['note'] and r['note']['text'][1:]  # drop the "i" icon glyph
        rt=r['reason'] and r['reason']['text']
        # language fixed: any shown message must equal the approved catalog text of THIS language
        langok=all(t is None or t in CAT[L].values() for t in (nt,rt))
        s['lang_ok']+=langok
        if not langok:issues['lang'].append((r['tag'],st,nt,rt))
        s['gaps_ok']+= r['g1']['avName']>=4 and abs(r['g1']['nameRace']-10)<=0.6 and abs(r['g2']['nameRace']-10)<=0.6
        s['no_overflow']+= (not r['hscroll'] and not r['small'])
        s['no_errs']+= not r['errs']
        s['tab24']+= abs(r['startToTab']-24)<=3 if r['tag'].split('/')[1] in('390','430','375') else 1
        s['start_disabled']+=r['startDisabled']
        s['note_shown']+= r['note'] is not None
        s['reason_shown']+= r['reason'] is not None
        s['guide']+=r['guide']
        if r['note'] and r['reason']:
            same=(nt==rt);s['note==reason']+=same
            if not same:issues['mismatch'].append((r['tag'],r['disc'],st,nt,rt))
        if r['note']: s['note_below_card2_10']+= abs(r['note']['gapBelowCard2']-10)<=1.5
        if r['reason']: s['reason_slot_'+str(r['reason']['slot'])]+=1
        if r['reason']: s['reason_aria_ok']+= bool(r['reason']['aria']==rt and r['reason']['desc'])
        if r['note']: s['note_aria_hidden']+= r['note']['ariaHidden']=='true'
        if r['note']: s['note_lines_max']=max(s['note_lines_max'],r['note']['lines'])
        if r['hscroll'] or r['small']: issues['layout'].append((r['tag'],r['disc'],st,r['hscroll'],r['small']))
        if not r['startDisabled'] and st!='both-selected(natural)':issues['enabled'].append((r['tag'],st))
for k,s in sorted(stat.items()): print(k,dict(s))
for k,v in issues.items(): print('ISSUE',k,len(v),v[:3])
