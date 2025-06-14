import * as React from "react";
import { Text, View } from "react-native";
import Svg, { Path, LinearGradient, Stop, Defs } from "react-native-svg";

const Logo = ({ withName = false, size = 35, textClassName = "", classname = "", props }) => {
	return (
		<View className={`flex-row items-center gap-3 ${classname}`}>
			<Svg
				xmlns="http://www.w3.org/2000/svg"
				data-name="Layer 2"
				viewBox="0 0 108.88 108.89"
				width={size}
				height={size}
				{...props}
			>
				<Defs>
					<LinearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
						{/* <Stop offset="0" stopColor="#5a7359" /> */}
						<Stop offset="0" stopColor="#a855f7" />
						<Stop offset="1" stopColor="#29aab1" />
					</LinearGradient>
				</Defs>
				<Path
					d="M108.88 36.3v36.29H72.59v36.3h-36.3c0-20.05-16.25-36.3-36.29-36.3V36.3h36.29V0h36.3c0 20.05 16.25 36.3 36.29 36.3Z"
					data-name="Layer 1"
					style={{
						fill: "url(#logoGradient)",
						strokeWidth: 1,
					}}
				/>
			</Svg>
			{withName && (
				<Text
					className={`text-robins-egg-blue-400 text-3xl font-dscript ${textClassName}`}
				>
					Drowse
				</Text>
			)}
		</View>
	);
};
export default Logo;
