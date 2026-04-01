import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, ColorType, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { PriceFeed, initPriceFeed, cleanupPriceFeed, fetchKlines, COIN_CONFIGS } from '../lib/price-feed';

export default function TradingViewChart({ coin }: { key?: React.Key, coin: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const vwapSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbUpperSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdFastSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdSlowSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdHistogramSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const legendRef = useRef<HTMLDivElement>(null);
  const vwapValueRef = useRef<HTMLSpanElement>(null);
  const smaValueRef = useRef<HTMLSpanElement>(null);
  const emaValueRef = useRef<HTMLSpanElement>(null);
  const bbValueRef = useRef<HTMLSpanElement>(null);
  const rsiValueRef = useRef<HTMLSpanElement>(null);
  const macdValueRef = useRef<HTMLSpanElement>(null);
  const isCrosshairActiveRef = useRef<boolean>(false);

  const [showVWAP, setShowVWAP] = useState(false);
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showBB, setShowBB] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    let cancelled = false;

    const setup = async () => {
    await initPriceFeed(coin);
    if (cancelled || !chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0f' },
        textColor: '#888',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)', style: 2 },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)', style: 2 },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(255, 255, 255, 0.4)',
          style: 2,
          labelBackgroundColor: '#333',
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.4)',
          style: 2,
          labelBackgroundColor: '#333',
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    });
    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ff4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ff4444',
    });
    seriesRef.current = candlestickSeries;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // set as an overlay
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // highest point of the series will be at 80% of the chart height
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.seriesData.size > 0 && legendRef.current) {
        isCrosshairActiveRef.current = true;
        const data = param.seriesData.get(candlestickSeries) as any;
        const volData = param.seriesData.get(volumeSeries) as any;
        if (data) {
          const { open, high, low, close } = data;
          const color = close >= open ? 'text-emerald-400' : 'text-red-400';
          const volStr = volData ? ` <span class="text-slate-500 ml-2">Vol</span> <span class="text-slate-300">${volData.value.toFixed(2)}</span>` : '';
          legendRef.current.innerHTML = `
            <span class="text-slate-500">O</span> <span class="${color}">${open.toFixed(2)}</span>
            <span class="text-slate-500 ml-2">H</span> <span class="${color}">${high.toFixed(2)}</span>
            <span class="text-slate-500 ml-2">L</span> <span class="${color}">${low.toFixed(2)}</span>
            <span class="text-slate-500 ml-2">C</span> <span class="${color}">${close.toFixed(2)}</span>${volStr}
          `;
        }
        
        // Update indicator values based on crosshair
        if (vwapValueRef.current) {
          const vwapData = param.seriesData.get(vwapSeries) as any;
          if (vwapData) vwapValueRef.current.innerText = vwapData.value.toFixed(2);
        }
        if (smaValueRef.current) {
          const smaData = param.seriesData.get(smaSeries) as any;
          if (smaData) smaValueRef.current.innerText = smaData.value.toFixed(2);
        }
        if (emaValueRef.current) {
          const emaData = param.seriesData.get(emaSeries) as any;
          if (emaData) emaValueRef.current.innerText = emaData.value.toFixed(2);
        }
        if (bbValueRef.current) {
          const bbUpperData = param.seriesData.get(bbUpperSeries) as any;
          const bbLowerData = param.seriesData.get(bbLowerSeries) as any;
          if (bbUpperData && bbLowerData) bbValueRef.current.innerText = `${bbUpperData.value.toFixed(2)} / ${bbLowerData.value.toFixed(2)}`;
        }
        if (rsiValueRef.current) {
          const rsiData = param.seriesData.get(rsiSeries) as any;
          if (rsiData) rsiValueRef.current.innerText = rsiData.value.toFixed(2);
        }
        if (macdValueRef.current) {
          const macdFastData = param.seriesData.get(macdFastSeries) as any;
          const macdSlowData = param.seriesData.get(macdSlowSeries) as any;
          const macdHistData = param.seriesData.get(macdHistogramSeries) as any;
          if (macdFastData && macdSlowData && macdHistData) {
            macdValueRef.current.innerText = `${macdFastData.value.toFixed(2)} / ${macdSlowData.value.toFixed(2)} / ${macdHistData.value.toFixed(2)}`;
          }
        }
      } else {
        isCrosshairActiveRef.current = false;
        if (legendRef.current) {
          legendRef.current.innerHTML = '';
        }
      }
    });

    const vwapSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      visible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    vwapSeriesRef.current = vwapSeries;

    const smaSeries = chart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 2,
      visible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    smaSeriesRef.current = smaSeries;

    const emaSeries = chart.addSeries(LineSeries, {
      color: '#f97316',
      lineWidth: 2,
      visible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    emaSeriesRef.current = emaSeries;

    const bbUpperSeries = chart.addSeries(LineSeries, {
      color: 'rgba(168, 85, 247, 0.5)',
      lineWidth: 1,
      visible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    bbUpperSeriesRef.current = bbUpperSeries;

    const bbLowerSeries = chart.addSeries(LineSeries, {
      color: 'rgba(168, 85, 247, 0.5)',
      lineWidth: 1,
      visible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });
    bbLowerSeriesRef.current = bbLowerSeries;

    const rsiSeries = chart.addSeries(LineSeries, {
      color: '#06b6d4',
      lineWidth: 2,
      visible: false,
      lastValueVisible: false,
      priceLineVisible: false,
      priceScaleId: 'rsi',
    });
    chart.priceScale('rsi').applyOptions({
      scaleMargins: {
        top: 0.8, // leave space for main chart
        bottom: 0,
      },
    });
    rsiSeriesRef.current = rsiSeries;

    const macdFastSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      visible: false,
      lastValueVisible: false,
      priceLineVisible: false,
      priceScaleId: 'macd',
    });
    macdFastSeriesRef.current = macdFastSeries;

    const macdSlowSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      visible: false,
      lastValueVisible: false,
      priceLineVisible: false,
      priceScaleId: 'macd',
    });
    macdSlowSeriesRef.current = macdSlowSeries;

    const macdHistogramSeries = chart.addSeries(HistogramSeries, {
      visible: false,
      lastValueVisible: false,
      priceLineVisible: false,
      priceScaleId: 'macd',
    });
    chart.priceScale('macd').applyOptions({
      scaleMargins: {
        top: 0.8, // leave space for main chart
        bottom: 0,
      },
    });
    macdHistogramSeriesRef.current = macdHistogramSeries;

    // Fetch real historical kline data from Binance REST API
    const cfg = COIN_CONFIGS[coin] || COIN_CONFIGS['BTC'];
    let initialData: any[] = [];
    const realKlines = await fetchKlines(cfg.binanceSymbol, '1m', 100);
    if (realKlines && realKlines.length > 0) {
      initialData = realKlines.map((k: any) => ({
        time: k.time as Time,
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
      }));
    } else {
      // Fallback: generate data if API fails
      const now = Math.floor(Date.now() / 1000);
      let p = PriceFeed.price || PriceFeed.dayOpen || 100;
      let trend = 0;
      for (let i = 100; i > 0; i--) {
        const time = now - i * 60;
        trend += (Math.random() - 0.5) * 0.001;
        const open = p;
        const close = p * (1 + trend + (Math.random() - 0.5) * 0.002);
        const high = Math.max(open, close) * (1 + Math.random() * 0.001);
        const low = Math.min(open, close) * (1 - Math.random() * 0.001);
        initialData.push({ time: time as Time, open, high, low, close });
        p = close;
      }
    }
    candlestickSeries.setData(initialData);

    const vwapData: any[] = [];
    const smaData: any[] = [];
    const emaData: any[] = [];
    const bbUpperData: any[] = [];
    const bbLowerData: any[] = [];
    const rsiData: any[] = [];
    const macdFastData: any[] = [];
    const macdSlowData: any[] = [];
    const macdHistogramData: any[] = [];
    const volumeData: any[] = [];
    
    let totalVol = 0;
    let totalVolPrice = 0;
    let ema = initialData[0].close;
    const k = 2 / (9 + 1);

    // RSI calculation variables
    let gains = 0;
    let losses = 0;
    const rsiPeriod = 14;

    // MACD calculation variables
    let ema12 = initialData[0].close;
    let ema26 = initialData[0].close;
    let signalEma = 0;
    const k12 = 2 / (12 + 1);
    const k26 = 2 / (26 + 1);
    const k9 = 2 / (9 + 1);

    for (let i = 0; i < initialData.length; i++) {
      const candle = initialData[i];
      
      // VWAP
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      // Use real volume from kline data if available, otherwise estimate
      const realKlineVol = realKlines && realKlines[i] ? realKlines[i].volume : 0;
      const vol = realKlineVol > 0 ? realKlineVol : Math.random() * 100 + 10;
      totalVol += vol;
      totalVolPrice += typicalPrice * vol;
      vwapData.push({ time: candle.time, value: totalVolPrice / totalVol });

      // Volume
      const isUp = candle.close >= candle.open;
      volumeData.push({ 
        time: candle.time, 
        value: vol, 
        color: isUp ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)' 
      });

      // RSI
      if (i > 0) {
        const change = candle.close - initialData[i - 1].close;
        if (i <= rsiPeriod) {
          if (change > 0) gains += change;
          else losses -= change;
          if (i === rsiPeriod) {
            const avgGain = gains / rsiPeriod;
            const avgLoss = losses / rsiPeriod;
            const rs = avgGain / (avgLoss === 0 ? 1 : avgLoss);
            rsiData.push({ time: candle.time, value: 100 - (100 / (1 + rs)) });
          }
        } else {
          const prevAvgGain = gains;
          const prevAvgLoss = losses;
          const currentGain = change > 0 ? change : 0;
          const currentLoss = change < 0 ? -change : 0;
          
          gains = (prevAvgGain * (rsiPeriod - 1) + currentGain) / rsiPeriod;
          losses = (prevAvgLoss * (rsiPeriod - 1) + currentLoss) / rsiPeriod;
          
          const rs = gains / (losses === 0 ? 1 : losses);
          rsiData.push({ time: candle.time, value: 100 - (100 / (1 + rs)) });
        }
      }

      // MACD
      ema12 = (candle.close - ema12) * k12 + ema12;
      ema26 = (candle.close - ema26) * k26 + ema26;
      const macdLine = ema12 - ema26;
      macdFastData.push({ time: candle.time, value: macdLine });

      if (i === 26) {
        signalEma = macdLine;
        macdSlowData.push({ time: candle.time, value: signalEma });
        macdHistogramData.push({ time: candle.time, value: macdLine - signalEma, color: macdLine >= signalEma ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 68, 68, 0.5)' });
      } else if (i > 26) {
        signalEma = (macdLine - signalEma) * k9 + signalEma;
        macdSlowData.push({ time: candle.time, value: signalEma });
        const hist = macdLine - signalEma;
        macdHistogramData.push({ time: candle.time, value: hist, color: hist >= 0 ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 68, 68, 0.5)' });
      }

      // SMA 20 & BB
      if (i >= 19) {
        let sum = 0;
        const periodCloses = [];
        for (let j = 0; j < 20; j++) {
          const c = initialData[i - j].close;
          sum += c;
          periodCloses.push(c);
        }
        const sma = sum / 20;
        smaData.push({ time: candle.time, value: sma });

        // BB StdDev
        let sumSq = 0;
        for (const c of periodCloses) {
          sumSq += Math.pow(c - sma, 2);
        }
        const stdDev = Math.sqrt(sumSq / 20);
        bbUpperData.push({ time: candle.time, value: sma + stdDev * 2 });
        bbLowerData.push({ time: candle.time, value: sma - stdDev * 2 });
      }

      // EMA 9
      ema = (candle.close - ema) * k + ema;
      emaData.push({ time: candle.time, value: ema });
    }

    vwapSeries.setData(vwapData);
    smaSeries.setData(smaData);
    emaSeries.setData(emaData);
    bbUpperSeries.setData(bbUpperData);
    bbLowerSeries.setData(bbLowerData);
    rsiSeries.setData(rsiData);
    macdFastSeries.setData(macdFastData);
    macdSlowSeries.setData(macdSlowData);
    macdHistogramSeries.setData(macdHistogramData);
    volumeSeries.setData(volumeData);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    let currentCandle = {
      time: Math.floor(Date.now() / 1000 / 60) * 60 as Time,
      open: PriceFeed.price,
      high: PriceFeed.price,
      low: PriceFeed.price,
      close: PriceFeed.price,
    };

    const closes = initialData.slice(-19).map(d => d.close);
    let currentEma = emaData[emaData.length - 1]?.value || PriceFeed.price;
    let currentTotalVol = totalVol;
    let currentTotalVolPrice = totalVolPrice;
    let currentCandleVol = 0;
    
    let currentGains = gains;
    let currentLosses = losses;
    
    let currentEma12 = ema12;
    let currentEma26 = ema26;
    let currentSignalEma = signalEma;

    let animationFrameId: number;
    let lastChartUpdate = 0;

    const tick = () => {
      if (cancelled) {
        window.removeEventListener('resize', handleResize);
        chart.remove();
        return;
      }
      PriceFeed.tick(); // advance simulation if not live

      const nowMs = Date.now();
      if (nowMs - lastChartUpdate > 50) { // Update chart at 20fps
        const price = PriceFeed.price;
        const time = Math.floor(nowMs / 1000 / 60) * 60 as Time;

        if (time !== currentCandle.time) {
          currentCandle = {
            time,
            open: price,
            high: price,
            low: price,
            close: price,
          };
          closes.push(price);
          if (closes.length > 20) closes.shift();
          
          const vol = Math.random() * 10 + 1;
          currentCandleVol = vol;
          const typicalPrice = price; // approximation for new candle
          currentTotalVol += vol;
          currentTotalVolPrice += typicalPrice * vol;
        } else {
          currentCandle.high = Math.max(currentCandle.high, price);
          currentCandle.low = Math.min(currentCandle.low, price);
          currentCandle.close = price;
          closes[closes.length - 1] = price;
          
          const vol = Math.random() * 2;
          currentCandleVol += vol;
          currentTotalVol += vol;
          currentTotalVolPrice += price * vol;
        }
        candlestickSeries.update(currentCandle);
        
        const isUp = currentCandle.close >= currentCandle.open;
        volumeSeries.update({
          time,
          value: currentCandleVol,
          color: isUp ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)'
        });
        
        // Update VWAP
        const vwapVal = currentTotalVolPrice / currentTotalVol;
        vwapSeries.update({ time, value: vwapVal });
        if (vwapValueRef.current && !isCrosshairActiveRef.current) vwapValueRef.current.innerText = vwapVal.toFixed(2);

        // Update SMA & BB
        if (closes.length === 20) {
          const sum = closes.reduce((a, b) => a + b, 0);
          const smaVal = sum / 20;
          smaSeries.update({ time, value: smaVal });
          if (smaValueRef.current && !isCrosshairActiveRef.current) smaValueRef.current.innerText = smaVal.toFixed(2);

          let sumSq = 0;
          for (const c of closes) {
            sumSq += Math.pow(c - smaVal, 2);
          }
          const stdDev = Math.sqrt(sumSq / 20);
          const upper = smaVal + stdDev * 2;
          const lower = smaVal - stdDev * 2;
          bbUpperSeries.update({ time, value: upper });
          bbLowerSeries.update({ time, value: lower });
          if (bbValueRef.current && !isCrosshairActiveRef.current) bbValueRef.current.innerText = `${upper.toFixed(2)} / ${lower.toFixed(2)}`;
        }

        // Update EMA
        const tempEma = (price - currentEma) * k + currentEma;
        emaSeries.update({ time, value: tempEma });
        if (emaValueRef.current && !isCrosshairActiveRef.current) emaValueRef.current.innerText = tempEma.toFixed(2);
        if (time !== currentCandle.time) {
          currentEma = tempEma;
        }
        
        // Update RSI
        if (closes.length >= 2) {
          const change = price - closes[closes.length - 2];
          const currentGain = change > 0 ? change : 0;
          const currentLoss = change < 0 ? -change : 0;
          
          const newGains = (currentGains * (rsiPeriod - 1) + currentGain) / rsiPeriod;
          const newLosses = (currentLosses * (rsiPeriod - 1) + currentLoss) / rsiPeriod;
          
          const rs = newGains / (newLosses === 0 ? 1 : newLosses);
          const rsiVal = 100 - (100 / (1 + rs));
          
          rsiSeries.update({ time, value: rsiVal });
          if (rsiValueRef.current && !isCrosshairActiveRef.current) rsiValueRef.current.innerText = rsiVal.toFixed(2);
          
          if (time !== currentCandle.time) {
            currentGains = newGains;
            currentLosses = newLosses;
          }
        }
        
        // Update MACD
        const tempEma12 = (price - currentEma12) * k12 + currentEma12;
        const tempEma26 = (price - currentEma26) * k26 + currentEma26;
        const macdLine = tempEma12 - tempEma26;
        const tempSignalEma = (macdLine - currentSignalEma) * k9 + currentSignalEma;
        const hist = macdLine - tempSignalEma;
        
        macdFastSeries.update({ time, value: macdLine });
        macdSlowSeries.update({ time, value: tempSignalEma });
        macdHistogramSeries.update({ time, value: hist, color: hist >= 0 ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 68, 68, 0.5)' });
        
        if (macdValueRef.current && !isCrosshairActiveRef.current) macdValueRef.current.innerText = `${macdLine.toFixed(2)} / ${tempSignalEma.toFixed(2)} / ${hist.toFixed(2)}`;
        
        if (time !== currentCandle.time) {
          currentEma12 = tempEma12;
          currentEma26 = tempEma26;
          currentSignalEma = tempSignalEma;
        }

        lastChartUpdate = nowMs;
      }

      animationFrameId = requestAnimationFrame(tick);
    };
    tick();

    }; // end setup()

    setup();

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      cleanupPriceFeed();
    };
  }, [coin]);

  useEffect(() => {
    if (vwapSeriesRef.current) {
      vwapSeriesRef.current.applyOptions({
        visible: showVWAP,
        lastValueVisible: showVWAP,
        priceLineVisible: showVWAP,
      });
    }
  }, [showVWAP]);

  useEffect(() => {
    if (smaSeriesRef.current) {
      smaSeriesRef.current.applyOptions({
        visible: showSMA,
        lastValueVisible: showSMA,
        priceLineVisible: showSMA,
      });
    }
  }, [showSMA]);

  useEffect(() => {
    if (emaSeriesRef.current) {
      emaSeriesRef.current.applyOptions({
        visible: showEMA,
        lastValueVisible: showEMA,
        priceLineVisible: showEMA,
      });
    }
  }, [showEMA]);

  useEffect(() => {
    if (bbUpperSeriesRef.current && bbLowerSeriesRef.current) {
      bbUpperSeriesRef.current.applyOptions({
        visible: showBB,
        lastValueVisible: showBB,
        priceLineVisible: showBB,
      });
      bbLowerSeriesRef.current.applyOptions({
        visible: showBB,
        lastValueVisible: showBB,
        priceLineVisible: showBB,
      });
    }
  }, [showBB]);

  useEffect(() => {
    if (rsiSeriesRef.current) {
      rsiSeriesRef.current.applyOptions({
        visible: showRSI,
        lastValueVisible: showRSI,
        priceLineVisible: showRSI,
      });
    }
  }, [showRSI]);

  useEffect(() => {
    if (macdFastSeriesRef.current && macdSlowSeriesRef.current && macdHistogramSeriesRef.current) {
      macdFastSeriesRef.current.applyOptions({
        visible: showMACD,
        lastValueVisible: showMACD,
        priceLineVisible: showMACD,
      });
      macdSlowSeriesRef.current.applyOptions({
        visible: showMACD,
        lastValueVisible: showMACD,
        priceLineVisible: showMACD,
      });
      macdHistogramSeriesRef.current.applyOptions({
        visible: showMACD,
        lastValueVisible: showMACD,
        priceLineVisible: showMACD,
      });
    }
  }, [showMACD]);

  return (
    <div className="w-full h-full absolute inset-0">
      <div ref={chartContainerRef} className="w-full h-full absolute inset-0 z-0" />
      
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div ref={legendRef} className="text-[11px] font-mono font-bold tracking-wider text-slate-300 h-4 flex items-center bg-black/40 px-2 rounded border border-white/5 w-fit"></div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowVWAP(!showVWAP)} 
            className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded transition-colors border flex items-center gap-2 ${showVWAP ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-black/40 text-slate-500 border-white/5 hover:bg-white/5 hover:text-slate-300'}`}
          >
          <span>VWAP</span>
          {showVWAP && <span ref={vwapValueRef} className="text-white font-mono">--</span>}
        </button>
        <button 
          onClick={() => setShowSMA(!showSMA)} 
          className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded transition-colors border flex items-center gap-2 ${showSMA ? 'bg-purple-600/20 text-purple-400 border-purple-500/30' : 'bg-black/40 text-slate-500 border-white/5 hover:bg-white/5 hover:text-slate-300'}`}
        >
          <span>SMA 20</span>
          {showSMA && <span ref={smaValueRef} className="text-white font-mono">--</span>}
        </button>
        <button 
          onClick={() => setShowEMA(!showEMA)} 
          className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded transition-colors border flex items-center gap-2 ${showEMA ? 'bg-orange-600/20 text-orange-400 border-orange-500/30' : 'bg-black/40 text-slate-500 border-white/5 hover:bg-white/5 hover:text-slate-300'}`}
        >
          <span>EMA 9</span>
          {showEMA && <span ref={emaValueRef} className="text-white font-mono">--</span>}
        </button>
        <button 
          onClick={() => setShowBB(!showBB)} 
          className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded transition-colors border flex items-center gap-2 ${showBB ? 'bg-pink-600/20 text-pink-400 border-pink-500/30' : 'bg-black/40 text-slate-500 border-white/5 hover:bg-white/5 hover:text-slate-300'}`}
        >
          <span>BB 20,2</span>
          {showBB && <span ref={bbValueRef} className="text-white font-mono">--</span>}
        </button>
        <button 
          onClick={() => setShowRSI(!showRSI)} 
          className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded transition-colors border flex items-center gap-2 ${showRSI ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30' : 'bg-black/40 text-slate-500 border-white/5 hover:bg-white/5 hover:text-slate-300'}`}
        >
          <span>RSI 14</span>
          {showRSI && <span ref={rsiValueRef} className="text-white font-mono">--</span>}
        </button>
        <button 
          onClick={() => setShowMACD(!showMACD)} 
          className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded transition-colors border flex items-center gap-2 ${showMACD ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' : 'bg-black/40 text-slate-500 border-white/5 hover:bg-white/5 hover:text-slate-300'}`}
        >
          <span>MACD 12,26,9</span>
          {showMACD && <span ref={macdValueRef} className="text-white font-mono">--</span>}
        </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 pointer-events-none opacity-20">
        <div className="text-4xl font-black tracking-widest text-white">SERIOUS TERMINAL v4.0</div>
        <div className="text-sm font-bold tracking-[0.3em] text-white">REAL-TIME ORDER FLOW</div>
      </div>
    </div>
  );
}
