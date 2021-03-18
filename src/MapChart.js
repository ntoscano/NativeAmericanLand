import React, { useState, useEffect } from "react";
import { csv } from "d3-fetch";
import { ColumnChart } from 'react-chartkick'
import { Chart } from "react-google-charts";
import populationData from "./populationData.csv"
import 'chart.js'


const percentChange = (prev, next) => {
	const x = parseInt(next) / parseInt(prev);
	return Math.floor(((parseInt(next) > parseInt(prev) ? x - 1 : (1 - x) * -1)) * 100);
}


const MapChart = () => {
	const [appStateData, setAppStateData] = useState(false);
	const [tribe, setTribe] = useState("Apache");
	const [statesSlect, setState] = useState(true);
	const [stateColumnData, setStateColumnData] = useState(["State", "Population"]);
	const [tribeColumnData, setTribeColumnData] = useState(["State", "Population"]);
	const [selection, setSelection] = useState("y1990");


	useEffect(() => {
		csv(populationData).then(population => {
			const stateData = {};
			const tribeData = {};
			population.columns.map((col) => {
				if (col !== "year" && col !== "state") {
					tribeData[col] = {
						y1990: {}, y2000: {}, y2010: {}
					};
				}
				return;
			});
			population.map((row) => {
				if (!stateData[row.state]) {
					stateData[row.state] = {};
				}
				Object.keys(row).map((col) => {
					if (tribeData[col]) {
						tribeData[col][`y${row.year}`][row.state] = row[col];
						if (stateData[row.state][col]) {
							stateData[row.state][col][`y${row.year}`] = row[col];
						} else {
							stateData[row.state][col] = { [`y${row.year}`]: row[col] };
						}
					}
					return;
				});
				return;
			});
			console.log(stateData, tribeData);

			Object.keys(stateData).map((state) => {
				stateData[state].metaData = {
					totalPopulation: {
						y1990: 0,
						y2000: 0,
						y2010: 0
					},
					change: {
						y2000: {
							percentChange: 0,
							largestGrowth: 0,
							largestDecline: 0
						},
						y2010: {
							percentChange: 0,
							largestGrowth: 0,
							largestDecline: 0
						},
					}
				};
				Object.keys(stateData[state]).map((stateTribe) => {
					// console.log(parseInt(stateData[state][stateTribe].y1990), stateData[state][stateTribe].y1990)
					stateData[state].metaData.totalPopulation.y1990 += parseInt(stateData[state][stateTribe].y1990) || 0;
					stateData[state].metaData.totalPopulation.y2000 += parseInt(stateData[state][stateTribe].y2000) || 0;
					stateData[state].metaData.totalPopulation.y2010 += parseInt(stateData[state][stateTribe].y2010) || 0;
					const y2000PercentChange = percentChange(stateData[state][stateTribe].y1990, stateData[state][stateTribe].y2000);
					const y2010PercentChange = percentChange(stateData[state][stateTribe].y2000, stateData[state][stateTribe].y2010);
					if (stateData[state].metaData.change.y2000.largestGrowth === 0) {
						stateData[state].metaData.change.y2000.largestGrowth = [stateTribe, y2000PercentChange];
					}
					if (stateData[state].metaData.change.y2010.largestGrowth === 0) {
						stateData[state].metaData.change.y2010.largestGrowth = [stateTribe, y2010PercentChange];
					}
					if (stateData[state].metaData.change.y2000.largestDecline === 0) {
						stateData[state].metaData.change.y2000.largestDecline = [stateTribe, y2000PercentChange];
					}
					if (stateData[state].metaData.change.y2010.largestDecline === 0) {
						stateData[state].metaData.change.y2010.largestDecline = [stateTribe, y2010PercentChange]
					}
					stateData[state].metaData.change.y2000.largestGrowth = y2000PercentChange > stateData[state].metaData.change.y2000.largestGrowth[1] ? [stateTribe, y2000PercentChange] : stateData[state].metaData.change.y2000.largestGrowth;
					stateData[state].metaData.change.y2010.largestGrowth = y2010PercentChange > stateData[state].metaData.change.y2010.largestGrowth[1] ? [stateTribe, y2010PercentChange] : stateData[state].metaData.change.y2010.largestGrowth;
					stateData[state].metaData.change.y2000.largestDecline = y2000PercentChange < stateData[state].metaData.change.y2000.largestDecline[1] ? [stateTribe, y2000PercentChange] : stateData[state].metaData.change.y2000.largestDecline;
					stateData[state].metaData.change.y2010.largestDecline = y2010PercentChange < stateData[state].metaData.change.y2010.largestDecline[1] ? [stateTribe, y2010PercentChange] : stateData[state].metaData.change.y2010.largestDecline;
					return;
				});
				stateData[state].metaData.change.y2000.percentChange = percentChange(stateData[state].metaData.totalPopulation.y1990, stateData[state].metaData.totalPopulation.y2000);
				stateData[state].metaData.change.y2010.percentChange = percentChange(stateData[state].metaData.totalPopulation.y2000, stateData[state].metaData.totalPopulation.y2010);
				return;
			});

			Object.keys(tribeData).map((tribe) => {
				tribeData[tribe].metaData = {
					totalPopulation: {
						y1990: 0,
						y2000: 0,
						y2010: 0
					},
					change: {
						largestGrowth: 0,
						y2000: {
							percentChange: 0,
							largestGrowth: 0,
							largestDecline: 0
						},
						y2010: {
							percentChange: 0,
							largestGrowth: 0,
							largestDecline: 0
						},
					}
				};

				Object.keys(tribeData[tribe]).map((year) => {
					if (year !== "metaData") {
						let yearPopulation = 0;
						Object.keys(tribeData[tribe][year]).map((state) => {
							yearPopulation += parseInt(tribeData[tribe][year][state]);
						})
						tribeData[tribe].metaData.totalPopulation[year] = yearPopulation;
					}
					return;
				})
				Object.keys(stateData).map((state) => {
					const y2000PercentChange = percentChange(tribeData[tribe].y1990[state], tribeData[tribe].y2000[state]);
					const y2010PercentChange = percentChange(tribeData[tribe].y2000[state], tribeData[tribe].y2010[state]);
					const totalGrowth = percentChange(tribeData[tribe].y1990[state], tribeData[tribe].y2010[state]);
					if (tribeData[tribe].metaData.change.y2000.largestGrowth === 0) {
						tribeData[tribe].metaData.change.y2000.largestGrowth = [state, y2000PercentChange];
					}
					if (tribeData[tribe].metaData.change.y2010.largestGrowth === 0) {
						tribeData[tribe].metaData.change.y2010.largestGrowth = [state, y2010PercentChange];
					}
					if (tribeData[tribe].metaData.change.y2000.largestDecline === 0) {
						tribeData[tribe].metaData.change.y2000.largestDecline = [state, y2000PercentChange];
					}
					if (tribeData[tribe].metaData.change.y2010.largestDecline === 0) {
						tribeData[tribe].metaData.change.y2010.largestDecline = [state, y2010PercentChange];
					}
					if (tribeData[tribe].metaData.change.largestGrowth === 0) {
						tribeData[tribe].metaData.change.largestGrowth = [state, totalGrowth];
					}
					tribeData[tribe].metaData.change.y2000.largestGrowth = y2000PercentChange > tribeData[tribe].metaData.change.y2000.largestGrowth[1] ? [state, y2000PercentChange] : tribeData[tribe].metaData.change.y2000.largestGrowth;
					tribeData[tribe].metaData.change.y2010.largestGrowth = y2010PercentChange > tribeData[tribe].metaData.change.y2010.largestGrowth[1] ? [state, y2010PercentChange] : tribeData[tribe].metaData.change.y2010.largestGrowth;
					tribeData[tribe].metaData.change.y2000.largestDecline = y2000PercentChange < tribeData[tribe].metaData.change.y2000.largestDecline[1] ? [state, y2000PercentChange] : tribeData[tribe].metaData.change.y2000.largestDecline;
					tribeData[tribe].metaData.change.y2010.largestDecline = y2010PercentChange < tribeData[tribe].metaData.change.y2000.largestDecline[1] ? [state, y2010PercentChange] : tribeData[tribe].metaData.change.y2010.largestDecline;

					tribeData[tribe].metaData.change.largestGrowth = totalGrowth > tribeData[tribe].metaData.change.largestGrowth[1] ? [state, totalGrowth] : tribeData[tribe].metaData.change.largestGrowth;
					return;
				})
				tribeData[tribe].metaData.change.y2000.percentChange = percentChange(tribeData[tribe].metaData.totalPopulation.y1990, tribeData[tribe].metaData.totalPopulation.y2000);
				tribeData[tribe].metaData.change.y2010.percentChange = percentChange(tribeData[tribe].metaData.totalPopulation.y2000, tribeData[tribe].metaData.totalPopulation.y2010);
				tribeData[tribe].metaData.totalPopulation.growth = percentChange(tribeData[tribe].metaData.totalPopulation.y1990, tribeData[tribe].metaData.totalPopulation.y2010);
				return;
			});


			const stateColumnData = [["State", "Population"]]
			Object.keys(stateData).map((state) => {
				stateColumnData.push([state, parseInt(stateData[state].metaData.totalPopulation[selection])]);
			});
			setStateColumnData(stateColumnData);

			setAppStateData({ tribeData, stateData });
			return { tribeData, stateData };
		});
	}, []);

	const displayStateLandData = (selection) => {
		const stateColumnData = [["State", "Population"]]
		Object.keys(appStateData.stateData).map((state) => {
			if (parseInt(appStateData.stateData[state].metaData.totalPopulation[selection])) {
				stateColumnData.push([state, parseInt(appStateData.stateData[state].metaData.totalPopulation[selection])]);
			}
		});
		setStateColumnData(stateColumnData);
		setState(true);
		return;
	}

	const displayTribeLandData = (selection) => {
		const stateColumnData = [["State", "Population"]];
		Object.keys(appStateData.stateData).map((state) => {
			console.log(appStateData.stateData, state, tribe)
			if (parseInt(appStateData.stateData[state][tribe][selection])) {
				stateColumnData.push([state, parseInt(appStateData.stateData[state][tribe][selection])]);
			}
		});
		setStateColumnData(stateColumnData);
		setState(false);
		return;
	}


	const isSelected = (regionName) => {
		return (regionName === tribe) ? " bg-light-gray " : "";
	}

	const sideNav = (region, isCounty) => {
		return (
			<div className={"flex-column h-100 overflow-hidden mb4 pb2 f4"}>
				<div className={"h-100" + (isCounty ? " overflow-y-scroll ba f6" : "")}>
					{Object.keys(region).sort().map((regionName, index) => {
						return (
							<div key={index} className={" ma2 pa2 tl bb " + isSelected(regionName)} onClick={() => {
								setTribe(regionName);
								displayTribeLandData(selection);
							}}>
								{regionName}
							</div>
						)
					})}
				</div>
			</div>
		)
	}

	if (!appStateData || !appStateData.stateData) {
		return (<div>loading</div>);
	}
	console.log(stateColumnData, appStateData)

	return (
		<div className="flex">
			<div className="bg-black-90 fixed w-100 ph3 pv3 pv4-ns ph4-m ph5-l absolute">
				<nav className="f6 fw6 ttu tracked">
					<a className="link dim white dib mr3" href="#" title="head">Native American Populations</a>
				</nav>
			</div>
			<div className="w-100">
				<div className="flex mt6 tc justify-center"></div>
				<div className="flex w-100 mb5">
					<div className={"w-20 f3 mh2 h-100 "} style={{ height: "900px" }}>
						{sideNav(appStateData.tribeData, true)}
					</div>

					<div className="w-90 mh3 dib">
						<div className="f3 mb3 tc mt2 justify-center relative">{statesSlect ? `All Nations - ${selection.slice(1)}` : `${tribe} - ${selection.slice(1)}`}</div>
						<div className={"ba mh3 tc justify-center relative" + (!statesSlect ? " bg-light-gray " : "")} onClick={() => {
							setSelection("y2010")
							displayStateLandData(selection);
						}}> View Population of all Nations</div>
						<div className="mt6 tl mh2">
							<div className="flex ba1 b--black bw1">
								<div className="flex-column w-60">
									<div className="mv2 pv1 bg-light-gray">Nation:</div>
									<div className="mv2 pv1">Population Growth from 1990 - 2010: </div>
									<div className="mv2 pv1 bg-light-gray">Location and Percent of Largest Growth:</div>
								</div>
								<div className="flex-column w-40">
									<div className="mv2 pv1 bg-light-gray"> {tribe}</div>
									<div className="mv2 pv1">{appStateData.tribeData[tribe].metaData.totalPopulation.growth}%</div>
									<div className="mv2 pv1 bg-light-gray	">
										{appStateData.tribeData[tribe].metaData.change.largestGrowth[1]}% - {appStateData.tribeData[tribe].metaData.change.largestGrowth[0]}
									</div>
								</div>
							</div>
						</div>
						<div className={"mt5 dib w-50"}>
							{<Chart chartType="GeoChart" options={{ resolution: 'provinces', region: "US", colorAxis: { colors: ['#00853f', 'black', '#e31b23'] }, backgroundColor: '#81d4fa', defaultColor: '#f5f5f5' }} data={stateColumnData} mapsApiKey="AIzaSyDoLW0la28ndzPjo2B0BybPZpJRi6vmbqI" />}
						</div>
						<div className="">
							<div className="flex mt3 justify-center">
								<div className={"w-20 ba mh3 " + (selection === "y1990" ? " bg-light-gray " : "")} onClick={() => {
									setSelection("y1990")
									if (statesSlect) {
										displayStateLandData(selection);
									} else {
										displayTribeLandData(selection);
									}
								}}>1990</div>
								<div className={"w-20 ba mh3 " + (selection === "y2000" ? " bg-light-gray " : "")} onClick={() => {
									setSelection("y2000")
									if (statesSlect) {
										displayStateLandData(selection);
									} else {
										displayTribeLandData(selection);
									}
								}}>2000</div>
								<div className={"w-20 ba mh3 " + (selection === "y2010" ? " bg-light-gray " : "")} onClick={() => {
									setSelection("y2010")
									if (statesSlect) {
										displayStateLandData(selection);
									} else {
										displayTribeLandData(selection);
									}
								}}> 2010</div>

							</div>
							<div className="">
								<div className={"flex justify-center"}>
									{<ColumnChart data={stateColumnData} />}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MapChart;
