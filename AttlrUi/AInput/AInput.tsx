import { View, Text, TextInput } from "react-native";
import React from "react";


const AInput = ({
  PlaceHolder,
  Width,
  Height,
  BackgroundColor,
  BorderColor
}: {
  PlaceHolder?: string;
  Width?: number;
  Height?: number;
  BackgroundColor?:string,
  BorderColor?:string
}) => {
  return (
    <View>
      <TextInput
        placeholder={PlaceHolder?PlaceHolder:''}
        style={{
          height: Height?Height:45,
          width:Width?Width: 100,

          borderRadius:10,
          backgroundColor:BackgroundColor?BackgroundColor:'gray',
          borderColor: BorderColor?BorderColor:'gray',
          borderWidth: 0.5,

          textAlign: "center",
        }}
      />
    </View>
  );
};

export default AInput;
