import sys
import json
import os
from devicecomm import DeviceComm

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Incorrect number of args were given."}))
        sys.exit(-1)

    if not os.path.exists(sys.argv[1]):
        sys.stdout.write(f'Commandset does not exist at path: {sys.argv[1]}')

    device = DeviceComm(sys.argv[1])
    device.initialize(hardware_name="None")

    jsonOut = {}
    jsonOut["commands"] = {}

    directionMapping = {0:"INPUT", 1:"OUTPUT", 2:"MEMORY", 3: "NONE"}

    for index, command_name in enumerate(device.commands):
        command = getattr(device, command_name)

        jsonOut["commands"][command_name] = {
            "parameters": {},
        }

        for param_name in {**command.inputs, **command.outputs}:
            parameter = command.find_parameter(param_name)
            if param_name not in jsonOut["commands"][command_name]["parameters"]:
                jsonOut["commands"][command_name]["parameters"].update({
                    param_name: {
                        "type": parameter.type_str,
                        "direction": directionMapping[parameter.direction]
                    }
                })

    sys.stdout.write(json.dumps(jsonOut))